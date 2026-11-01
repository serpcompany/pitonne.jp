import fs from 'node:fs'
import { describe, expect, it, test } from 'vitest'
import {
  expression,
  readWorkflow,
  type WorkflowJob,
  type WorkflowStep,
  workflowFiles
} from './workflows'

const workflows = workflowFiles()
const actionAtCommit = /^[\w.-]+\/[\w.-]+(?:\/[\w.-]+)*@[0-9a-f]{40}$/
const pinsTable = fs.readFileSync('docs/agents/ci.md', 'utf8').split('\n')
const pinRow = /^\| `([\w./-]+)` \| `([0-9a-f]{40})` \| (v[\d.]+) \| (.+) \|$/

const jobsOf = (file: string) => Object.entries(readWorkflow(file).jobs)
const stepsOf = (job: WorkflowJob): WorkflowStep[] => job.steps ?? []
const actionsIn = (file: string) =>
  jobsOf(file)
    .flatMap(([, job]) => [job.uses, ...stepsOf(job).map(step => step.uses)])
    .filter((uses): uses is string => Boolean(uses) && !uses?.startsWith('./'))

const writes = (grants: Record<string, string> | undefined) =>
  Object.entries(grants ?? {})
    .filter(([, level]) => level === 'write')
    .map(([scope]) => scope)

describe('every workflow', () => {
  it('is found', () => {
    expect(workflows).toEqual(
      expect.arrayContaining(['ci.yml', 'deploy.yml', 'promote.yml', 'sync-staging.yml'])
    )
  })

  test.each(workflows)('%s runs each action at a commit that ci.md lists beside it', file => {
    for (const uses of actionsIn(file)) {
      expect(uses, file).toMatch(actionAtCommit)
      const [name, commit] = uses.split('@')
      const row = pinsTable.find(line => line.startsWith(`| \`${name}\` | \`${commit}\` |`))
      expect(row, `${uses} in ${file}: a row in docs/agents/ci.md`).toBeDefined()
      expect(row, `${uses} in ${file}`).toContain(`\`${file}\``)
    }
  })

  it('lists no pin in ci.md that nothing runs, and each pin once', () => {
    const rows = pinsTable.flatMap(line => {
      const found = pinRow.exec(line)
      return found ? [{ action: `${found[1]}@${found[2]}`, files: found[4] }] : []
    })
    expect(rows.length).toBeGreaterThan(5)
    const used = new Set(workflows.flatMap(actionsIn))
    for (const row of rows) {
      expect(used, row.action).toContain(row.action)
      const files = [...row.files.matchAll(/`([\w.-]+\.yml)`/g)].map(found => found[1])
      expect(files.sort(), row.action).toEqual(
        workflows.filter(file => actionsIn(file).includes(row.action)).sort()
      )
    }
    expect(new Set(rows.map(row => row.action.split('@')[0])).size).toBe(rows.length)
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

  test.each(workflows)('%s never puts an expression in a shell script', file => {
    for (const [id, job] of jobsOf(file)) {
      for (const step of stepsOf(job)) expect(step.run ?? '', `${file}: ${id}`).not.toContain('${{')
    }
  })

  test.each(workflows)('%s takes Node from .node-version and pnpm from packageManager', file => {
    for (const [id, job] of jobsOf(file)) {
      for (const step of stepsOf(job)) {
        if (step.uses?.startsWith('actions/setup-node@'))
          expect(step.with?.['node-version-file'], `${file}: ${id}`).toBe('.node-version')
        if (step.uses?.startsWith('pnpm/action-setup@'))
          expect(step.with?.version, `${file}: ${id}`).toBeUndefined()
      }
    }
    expect(fs.readFileSync(`.github/workflows/${file}`, 'utf8')).not.toMatch(/node-version:/)
  })

  test.each(
    workflows
  )('%s installs @serpcompany/verify with the job’s own token, and says what it needs when that fails', file => {
    for (const [id, job] of jobsOf(file)) {
      const steps = stepsOf(job)
      const at = steps.findIndex(step => step.run === 'pnpm install --frozen-lockfile')
      if (at === -1) continue
      const install = steps[at]
      expect(job.permissions?.packages, `${file}: ${id}`).toBe('read')
      expect(install.env, `${file}: ${id}`).toEqual({ NODE_AUTH_TOKEN: expression('github.token') })
      const setup = steps.slice(0, at).find(step => step.uses?.startsWith('actions/setup-node@'))
      expect(setup?.with, `${file}: ${id}`).toMatchObject({
        cache: 'pnpm',
        'registry-url': 'https://npm.pkg.github.com',
        scope: '@serpcompany'
      })
      expect(steps.slice(0, at).some(step => step.uses?.startsWith('pnpm/action-setup@'))).toBe(
        true
      )
      expect(steps[at + 1], `${file}: ${id}`).toMatchObject({
        if: `failure() && steps.${install.id}.outcome == 'failure'`
      })
      expect(steps[at + 1].run).toContain('Manage Actions access')
    }
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
