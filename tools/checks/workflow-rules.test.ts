import fs from 'node:fs'
import { describe, expect, it, test } from 'vitest'
import {
  actionFile,
  expression,
  localActions,
  readAction,
  readWorkflow,
  type WorkflowJob,
  type WorkflowStep,
  workflowFiles
} from './workflows'

const workflows = workflowFiles()
const actions = localActions()
const SETUP = 'setup-node-pnpm'
const actionAtCommit = /^[\w.-]+\/[\w.-]+(?:\/[\w.-]+)*@[0-9a-f]{40}$/
const pinsTable = fs.readFileSync('docs/agents/ci.md', 'utf8').split('\n')
const pinRow = /^\| `([\w./-]+)` \| `([0-9a-f]{40})` \| (v[\d.]+) \| (.+) \|$/

const jobsOf = (file: string) => Object.entries(readWorkflow(file).jobs)
const stepsOf = (job: WorkflowJob): WorkflowStep[] => job.steps ?? []

type Source = { file: string; text: string; uses: (string | undefined)[]; steps: WorkflowStep[] }

const sources: Source[] = [
  ...workflows.map(file => {
    const jobs = jobsOf(file).map(([, job]) => job)
    const steps = jobs.flatMap(stepsOf)
    return {
      file,
      text: fs.readFileSync(`.github/workflows/${file}`, 'utf8'),
      uses: [...jobs.map(job => job.uses), ...steps.map(step => step.uses)],
      steps
    }
  }),
  ...actions.map(name => {
    const steps = readAction(name).runs.steps
    const file = actionFile(name)
    return { file, text: fs.readFileSync(file, 'utf8'), uses: steps.map(step => step.uses), steps }
  })
]

const named = sources.map(source => [source.file, source] as const)

const pinnedIn = (source: Source) =>
  source.uses.filter((uses): uses is string => Boolean(uses) && !uses?.startsWith('./'))

const writes = (grants: Record<string, string> | undefined) =>
  Object.entries(grants ?? {})
    .filter(([, level]) => level === 'write')
    .map(([scope]) => scope)

describe('every workflow', () => {
  it('is found, beside the one local action', () => {
    expect(workflows).toEqual(
      expect.arrayContaining(['ci.yml', 'deploy.yml', 'promote.yml', 'sync-staging.yml'])
    )
    expect(actions).toEqual([SETUP])
  })

  test.each(workflows)('%s gives every job that runs on a runner a time limit', file => {
    for (const [id, job] of jobsOf(file)) {
      if (job.uses) continue
      expect(job['timeout-minutes'], `${file}: ${id}`).toBeGreaterThan(0)
    }
  })

  test.each(
    workflows
  )('%s grants only reads at the top, and every write in a job of its own', file => {
    const workflow = readWorkflow(file)
    expect(workflow.permissions, file).toBeDefined()
    expect(writes(workflow.permissions), file).toEqual([])
    expect(JSON.stringify(workflow)).not.toMatch(/(read|write)-all/)
  })

  test.each(
    workflows
  )('%s never starts on pull_request_target, which runs the default branch’s copy', file => {
    expect(Object.keys(readWorkflow(file).on ?? {}), file).not.toContain('pull_request_target')
  })
})

describe('every workflow and local action', () => {
  test.each(named)('%s runs each action at a commit that ci.md lists beside it', (_, source) => {
    for (const uses of pinnedIn(source)) {
      expect(uses, source.file).toMatch(actionAtCommit)
      const [name, commit] = uses.split('@')
      const row = pinsTable.find(line => line.startsWith(`| \`${name}\` | \`${commit}\` |`))
      expect(row, `${uses} in ${source.file}: a row in docs/agents/ci.md`).toBeDefined()
      expect(row, `${uses} in ${source.file}`).toContain(`\`${source.file}\``)
    }
  })

  it('lists no pin in ci.md that nothing runs, and each pin once', () => {
    const rows = pinsTable.flatMap(line => {
      const found = pinRow.exec(line)
      return found ? [{ action: `${found[1]}@${found[2]}`, files: found[4] }] : []
    })
    expect(rows.length).toBeGreaterThan(5)
    const used = new Set(sources.flatMap(pinnedIn))
    for (const row of rows) {
      expect(used, row.action).toContain(row.action)
      const files = [...row.files.matchAll(/`([\w./-]+\.yml)`/g)].map(found => found[1])
      expect(files.sort(), row.action).toEqual(
        sources
          .filter(source => pinnedIn(source).includes(row.action))
          .map(source => source.file)
          .sort()
      )
    }
    expect(new Set(rows.map(row => row.action.split('@')[0])).size).toBe(rows.length)
  })

  test.each(named)('%s never puts an expression in a shell script', (_, source) => {
    for (const step of source.steps) expect(step.run ?? '', source.file).not.toContain('${{')
  })

  test.each(named)('%s takes Node from .node-version and pnpm from packageManager', (_, source) => {
    for (const step of source.steps) {
      if (step.uses?.startsWith('actions/setup-node@'))
        expect(step.with?.['node-version-file'], source.file).toBe('.node-version')
      if (step.uses?.startsWith('pnpm/action-setup@'))
        expect(step.with?.version, source.file).toBeUndefined()
    }
    expect(source.text, source.file).not.toMatch(/node-version:/)
  })
})

describe('installing @serpcompany/verify', () => {
  test.each(
    workflows
  )('%s installs only through the setup action, after the job’s own checkout and with the job’s own token', file => {
    for (const [id, job] of jobsOf(file)) {
      const steps = stepsOf(job)
      for (const step of steps)
        expect(step.run ?? '', `${file}: ${id}`).not.toMatch(/\bpnpm (i|install|add)\b/)
      const at = steps.findIndex(step => step.uses === `./.github/actions/${SETUP}`)
      if (at === -1) continue
      expect(job.permissions?.packages, `${file}: ${id}`).toBe('read')
      expect(steps[at].with, `${file}: ${id}`).toEqual({ token: expression('github.token') })
      const checkout = steps.slice(0, at).find(step => step.uses?.startsWith('actions/checkout@'))
      expect(checkout, `${file}: ${id}`).toBeDefined()
      expect(steps[at].if, `${file}: ${id}`).toBe(checkout?.if)
    }
  })

  it('the setup action installs with the token it is given, and says what it needs when that fails', () => {
    const action = readAction(SETUP)
    expect(action.runs.using).toBe('composite')
    expect(action.inputs?.token?.required).toBe(true)
    const steps = action.runs.steps
    const at = steps.findIndex(step => step.run === 'pnpm install --frozen-lockfile')
    const install = steps[at]
    expect(install.env).toEqual({ NODE_AUTH_TOKEN: expression('inputs.token') })
    const setup = steps.slice(0, at).find(step => step.uses?.startsWith('actions/setup-node@'))
    expect(setup?.with).toMatchObject({
      cache: 'pnpm',
      'registry-url': 'https://npm.pkg.github.com',
      scope: '@serpcompany'
    })
    expect(steps.slice(0, at).some(step => step.uses?.startsWith('pnpm/action-setup@'))).toBe(true)
    expect(steps[at + 1]).toMatchObject({
      if: `failure() && steps.${install.id}.outcome == 'failure'`
    })
    expect(steps[at + 1].run).toContain('Manage Actions access')
    for (const step of steps.filter(each => each.run)) expect(step.shell, step.name).toBe('bash')
  })
})

describe('the versions the workflows build with', () => {
  it('.node-version names one major version that package.json accepts', () => {
    const node = fs.readFileSync('.node-version', 'utf8')
    expect(node).toMatch(/^\d+\n$/)
    const engines = JSON.parse(fs.readFileSync('package.json', 'utf8')).engines.node
    expect(engines).toBe(`>=${node.trim()} <${Number(node) + 2}`)
  })

  it('package.json names the pnpm the workflows set up', () => {
    expect(JSON.parse(fs.readFileSync('package.json', 'utf8')).packageManager).toMatch(
      /^pnpm@\d+\.\d+\.\d+$/
    )
  })
})
