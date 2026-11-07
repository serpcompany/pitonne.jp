import { describe, expect, it } from 'vitest'
import { simulate } from './job-results'
import {
  allText,
  branches,
  expression,
  job,
  needs,
  readWorkflow,
  scripts,
  step,
  stepIndex,
  textValues,
  type Workflow,
  workflowFiles,
  workflowScripts
} from './workflows'

const ci = readWorkflow('ci.yml')
const deploy = readWorkflow('deploy.yml')
const sync = readWorkflow('sync-staging.yml')
const promote = readWorkflow('promote.yml')
const pagesDeploy = job(deploy, 'deploy')
const cloudflareTokenOnly = { CLOUDFLARE_API_TOKEN: expression('secrets.CLOUDFLARE_API_TOKEN') }
const CHECKS = ['verify', 'test', 'e2e', 'lighthouse']
const VERIFY_STEP = 'The shared checks the change can affect, at the version the lockfile pins'
const STOP_STEP = "Stop when the serp-agent app's key isn't available to this repository"

function permissionGrants(workflow: Workflow, exceptJobs: string[] = []): Record<string, string>[] {
  const jobGrants = Object.entries(workflow.jobs)
    .filter(([id]) => !exceptJobs.includes(id))
    .map(([, owner]) => owner.permissions)
  return [workflow.permissions, ...jobGrants].filter(
    (grant): grant is Record<string, string> => grant !== undefined
  )
}

describe('CI and deploy workflows', () => {
  it('tests and deploys pushes to staging and main', () => {
    expect(ci.on.push?.branches).toEqual(expect.arrayContaining(['staging', 'main']))
    expect(job(ci, 'deploy').with?.environment).toBe(
      expression("github.ref_name == 'main' && 'production' || 'staging'")
    )
  })

  it('deploys code changes only after every check passes', () => {
    const gated = job(ci, 'deploy')
    expect(needs(gated)).toEqual(['changes', ...CHECKS])
    expect(gated.if).toContain("needs.changes.outputs.fast != 'true'")
    expect(allText(gated)).not.toContain('always()')
  })

  it('deploys and previews nothing for a docs-only change, each by a condition of its own', () => {
    for (const id of ['deploy', 'deploy-content', 'preview']) {
      expect(needs(job(ci, id)), id).toContain('changes')
      expect(job(ci, id).if, id).toContain("needs.changes.outputs.docs != 'true'")
    }
    expect(job(ci, 'alert').if, 'a red main alerts whatever the push changed').not.toContain(
      'needs.changes.outputs.docs'
    )
    for (const id of ['test', 'e2e', 'lighthouse'])
      expect(job(ci, id).if, id).toContain("needs.changes.outputs.docs != 'true'")
    expect(job(ci, 'test').if).toBe(
      expression("!cancelled() && needs.changes.outputs.docs != 'true'")
    )
    const changes = job(ci, 'changes')
    expect(changes.outputs?.docs).toBe(expression('steps.classify.outputs.docs_only'))
    expect(step(changes, 'classify').env?.DIFF_BASE).toBe(
      expression("github.event_name == 'push' && github.event.before || 'HEAD^1'")
    )
    expect(changes.steps?.[0].with?.['fetch-depth']).toBe(
      expression("github.event_name == 'pull_request' && 2 || 0")
    )
  })

  it('deploys CMS content as soon as it builds, whatever any test result says', () => {
    const content = job(ci, 'deploy-content')
    expect(needs(content)).toEqual(['changes'])
    expect(content.if).toContain("needs.changes.outputs.fast == 'true'")
    const changes = job(ci, 'changes')
    expect(scripts(changes)).toContain('node scripts/draft-only-change.mjs')
    expect(scripts(changes)).toMatch(/if \[ "\$CONTENT_ONLY" = true \]; then\n\s+fast=true\n/)
    expect(allText(changes)).not.toContain('BEFORE')
  })

  it('deploys a commit that already passed every check in CI for a push (a promotion) without checking it again', () => {
    const changes = job(ci, 'changes')
    const fast = step(changes, 'fast')
    expect(fast.env?.CHECKS?.split(' ')).toEqual(CHECKS)
    expect(fast.env?.GITHUB_TOKEN).toBe(expression('github.token'))
    expect(fast.run).toContain(
      'elif node scripts/ci-passed.mjs checks "$GITHUB_SHA" staging,main "$CHECKS"; then'
    )
    const receipts = step(changes, 'receipts')
    expect(receipts.if).toBe(
      "github.event_name == 'push' && steps.classify.outputs.content_only != 'true' && steps.classify.outputs.docs_only != 'true'"
    )
    expect(fast.if).toBe(
      "github.event_name == 'push' && steps.classify.outputs.docs_only != 'true'"
    )
    expect(receipts.run).toContain('if node scripts/ci-passed.mjs receipt "$suite" "$TREE"; then')
    expect(changes.permissions).toEqual({ contents: 'read', actions: 'read' })
    for (const workflow of [ci, promote])
      expect(allText(workflow)).not.toMatch(/check-runs|actions\/artifacts/)
  })

  it('runs pnpm verify against the commit’s parent, with the serp-agent app’s token narrowed to reading', () => {
    const verify = job(ci, 'verify')
    expect(needs(verify)).toEqual(['changes'])
    expect(verify.if).toBe(expression('!cancelled()'))
    expect(verify.permissions).toEqual({ contents: 'read', packages: 'read' })
    expect(verify.steps?.[0].with?.['fetch-depth']).toBe(2)
    expect(step(verify, VERIFY_STEP)).toEqual({
      name: VERIFY_STEP,
      env: {
        SERP_VERIFY_GITHUB_TOKEN: expression('steps.app-token.outputs.token'),
        SERP_VERIFY_BASE: 'HEAD^1',
        CHECKS: expression("needs.changes.outputs.docs == 'true' && 'docs,secrets' || ''")
      },
      run: 'if [ -n "$CHECKS" ]; then\n  pnpm verify "$CHECKS"\nelse\n  pnpm verify\nfi\n'
    })
    expect(step(verify, 'app-token')).toEqual({
      name: "A short-lived token that reads the organization's private repositories",
      id: 'app-token',
      uses: expect.stringMatching(/^actions\/create-github-app-token@[0-9a-f]{40}$/),
      with: {
        'app-id': expression('vars.SERP_AGENT_APP_ID'),
        'private-key': expression('secrets.SERP_AGENT_PRIVATE_KEY'),
        owner: expression('github.repository_owner'),
        'permission-contents': 'read',
        'permission-issues': 'read',
        'permission-pull-requests': 'read'
      }
    })
    expect(stepIndex(verify, 'app-token')).toBeLessThan(stepIndex(verify, VERIFY_STEP))
    const configured = simulate(ci, {
      github: { event_name: 'pull_request', repository: 'serpcompany/pitonne.jp', event: {} },
      vars: { SERP_AGENT_APP_ID: '123' },
      secrets: { SERP_AGENT_PRIVATE_KEY: 'key' }
    })
    expect(configured.stepRuns('verify', 'app-token')).toBe(true)
    expect(configured.stepRuns('verify', VERIFY_STEP)).toBe(true)
  })

  it('keeps the serp-agent app’s key and token in verify’s three steps that need them', () => {
    const verify = job(ci, 'verify')
    const holders = [STOP_STEP, 'app-token', VERIFY_STEP]
    const keyOrToken = /SERP_AGENT_|create-github-app-token|app-token/
    for (const each of verify.steps ?? [])
      if (!holders.some(name => [each.name, each.id].includes(name)))
        expect(allText(each), String(each.name ?? each.uses)).not.toMatch(keyOrToken)
    expect(verify.env).toEqual({
      HAS_APP_KEY: expression(
        "secrets.SERP_AGENT_PRIVATE_KEY != '' && vars.SERP_AGENT_APP_ID != ''"
      )
    })
    for (const [id, other] of Object.entries(ci.jobs).filter(([id]) => id !== 'verify'))
      expect(allText(other), id).not.toMatch(keyOrToken)
    expect(allText({ ...ci, jobs: {} }), 'ci.yml outside its jobs').not.toMatch(keyOrToken)
    for (const file of workflowFiles().filter(name => name !== 'ci.yml'))
      expect(allText(readWorkflow(file)), file).not.toMatch(keyOrToken)
  })

  it('stops verify with the owner step to take when the app’s key or ID is missing, and only then', () => {
    const scenario = (vars: Record<string, string>, secrets: Record<string, string>) =>
      simulate(ci, {
        github: { event_name: 'pull_request', repository: 'serpcompany/pitonne.jp', event: {} },
        vars,
        secrets
      })
    const verify = job(ci, 'verify')
    const id = { SERP_AGENT_APP_ID: '123' }
    const key = { SERP_AGENT_PRIVATE_KEY: 'key' }
    expect(scenario(id, key).stepRuns('verify', STOP_STEP)).toBe(false)
    expect(scenario(id, {}).stepRuns('verify', STOP_STEP)).toBe(true)
    expect(scenario({}, key).stepRuns('verify', STOP_STEP)).toBe(true)
    expect(scenario({}, {}).stepRuns('verify', STOP_STEP)).toBe(true)
    expect(step(verify, STOP_STEP)).toEqual({
      name: STOP_STEP,
      if: "env.HAS_APP_KEY != 'true'",
      run: expect.stringMatching(
        /^echo "::error title=[^"$]*::Without SERP_AGENT_APP_ID and SERP_AGENT_PRIVATE_KEY [^"$]*"\nexit 1\n$/
      )
    })
    expect(allText(verify), 'verify carries on past no step').not.toContain('continue-on-error')
    expect(stepIndex(verify, STOP_STEP)).toBeLessThan(stepIndex(verify, 'app-token'))
  })

  it('alerts the owner when a check or a Production deploy fails on main instead of blocking publishing', () => {
    const alert = job(ci, 'alert')
    expect(needs(alert).sort()).toEqual(['changes', ...CHECKS, 'deploy-content', 'deploy'].sort())
    expect(alert.if).toContain(
      "always() && github.event_name == 'push' && github.ref_name == 'main'"
    )
    expect(alert.if).toContain("contains(needs.*.result, 'failure')")
    expect(alert.concurrency?.group).toBe('alert-red-main')
    expect(alert.permissions).toMatchObject({ issues: 'write' })
    expect(scripts(alert)).toContain('@devinschumacher')
    expect(scripts(alert)).toContain('gh issue create')
    expect(scripts(alert)).toContain('gh issue comment')
  })

  it('keeps the draft-only skip out of the deploy concurrency group', () => {
    for (const id of ['deploy', 'deploy-content'])
      expect(job(ci, id).if).toContain("needs.changes.outputs.skip != 'true'")
    expect(allText(job(ci, 'changes'))).not.toContain('concurrency')
  })

  it('previews same-repository PRs into staging or main after validation', () => {
    const preview = job(ci, 'preview')
    expect(needs(preview)).toEqual(['changes', 'test'])
    expect(preview.if).toContain(
      `contains(fromJSON('["staging", "main"]'), github.event.pull_request.base.ref)`
    )
    expect(preview.if).toContain(
      'github.event.pull_request.head.repo.full_name == github.repository'
    )
    expect(preview.with).toMatchObject({
      environment: 'preview',
      pr: expression('github.event.pull_request.number'),
      ref: expression('github.event.pull_request.head.sha')
    })
  })

  it('cancels superseded PR runs but never a push run', () => {
    expect(ci.concurrency).toEqual({
      group: `${expression('github.workflow')}-${expression("github.event_name == 'pull_request' && github.ref || github.run_id")}`,
      'cancel-in-progress': expression("github.event_name == 'pull_request'")
    })
  })

  it('never uploads an older commit over a newer live one', () => {
    const target = step(pagesDeploy, 'target')
    expect(target.run).toBe('node scripts/deploy-target.mjs "$PAGES_BRANCH" "$DEPLOY_SHA"')
    expect(target.if).toBe("env.DEPLOY_ENV != 'preview'")
    expect(target['continue-on-error']).toBeUndefined()
    const checkout = step(pagesDeploy, 'Check out the chosen commit')
    expect(checkout.if).toBe(
      "env.DEPLOY_ENV != 'preview' && steps.target.outputs.sha != env.DEPLOY_SHA"
    )
    expect(stepIndex(pagesDeploy, 'Check out the chosen commit')).toBe(
      stepIndex(pagesDeploy, 'target') + 1
    )
    expect(stepIndex(pagesDeploy, 'Set up Node and pnpm, and install')).toBeGreaterThan(
      stepIndex(pagesDeploy, 'Check out the chosen commit')
    )
    expect(stepIndex(pagesDeploy, 'Build static export')).toBeGreaterThan(
      stepIndex(pagesDeploy, 'Set up Node and pnpm, and install')
    )
    expect(allText(deploy)).not.toContain('outputs.skip')
  })

  it('serializes deploys per target and environment without cancelling a running one', () => {
    expect(pagesDeploy.concurrency).toEqual({
      group: `deploy-pages-${expression("inputs.environment == 'preview' && format('pr-{0}', inputs.pr) || inputs.environment || (github.ref_name == 'main' && 'production') || github.ref_name")}`,
      'cancel-in-progress': false
    })
  })

  it('deploys Production only from main, Staging only from staging, and previews only to pr-<n>', () => {
    const resolve = step(pagesDeploy, 'Resolve environment').run
    expect(resolve).toContain('production) [ "$GITHUB_REF" = refs/heads/main ]')
    expect(resolve).toContain('staging) [ "$GITHUB_REF" = refs/heads/staging ]')
    expect(resolve).toContain('branch="pr-$PR_NUMBER"')
    expect(resolve).toContain('echo "DEPLOY_ENV=$TARGET"')
    expect(step(pagesDeploy, 'deploy').with?.command).toContain(
      `--branch=${expression('env.PAGES_BRANCH')}`
    )
    expect(allText(deploy)).not.toMatch(/--branch[= ]main/)
  })

  it("checks each environment's indexing signals before deploying and smoke-tests them after", () => {
    const verify = step(pagesDeploy, 'Verify static output')
    expect(verify.run).toBe('pnpm audit:out')
    expect(verify.env).toBeUndefined()
    expect(step(pagesDeploy, 'Resolve environment').run).toContain('echo "DEPLOY_ENV=$TARGET"')
    expect(stepIndex(pagesDeploy, 'Verify static output')).toBe(
      stepIndex(pagesDeploy, 'Build static export') + 1
    )
    expect(job(ci, 'test').steps?.map(each => each.run)).toContain('pnpm audit:out')
    for (const file of workflowFiles())
      expect(allText(readWorkflow(file)), file).not.toMatch(/out\/(robots\.txt|_headers)/)
    const smoke = step(pagesDeploy, 'Smoke-test environment behaviour').run
    expect(smoke).toContain(
      'node scripts/smoke-environment.mjs production https://pitonne-jp.pages.dev https://pitonne.jp'
    )
    expect(allText(deploy)).not.toMatch(/smoke-environment\.mjs production[^\n]*DEPLOYMENT_URL/)
    expect(smoke).toContain('node scripts/smoke-environment.mjs staging')
    expect(smoke).toContain('https://staging.pitonne.jp')
    expect(smoke).toContain('node scripts/smoke-environment.mjs preview')
    expect(stepIndex(pagesDeploy, 'Verify static output')).toBeLessThan(
      stepIndex(pagesDeploy, 'deploy')
    )
    expect(stepIndex(pagesDeploy, 'Smoke-test environment behaviour')).toBeGreaterThan(
      stepIndex(pagesDeploy, 'deploy')
    )
  })

  it('keeps workflow tokens minimal and leaves the PR preview comment to Cloudflare Pages', () => {
    for (const grant of [...permissionGrants(ci, ['alert']), ...permissionGrants(deploy)]) {
      for (const scope of ['pull-requests', 'issues', 'contents'])
        expect(grant[scope]).not.toBe('write')
    }
    for (const workflow of [ci, deploy])
      expect(allText(workflow)).not.toContain('actions/github-script')
    const secretGrants = Object.values(ci.jobs).flatMap(owner =>
      owner.secrets ? [owner.secrets] : []
    )
    expect(secretGrants).toEqual([cloudflareTokenOnly, cloudflareTokenOnly, cloudflareTokenOnly])
    expect(
      textValues(ci).filter(value => value.includes('secrets.CLOUDFLARE_API_TOKEN'))
    ).toHaveLength(3)
    expect(allText(ci)).not.toContain('RELEASE_DEPLOY_KEY')
    expect(step(pagesDeploy, 'deploy').with?.gitHubToken).toBe(
      expression("env.DEPLOY_ENV != 'preview' && github.token || ''")
    )
  })
})

describe('staging sync and promotion workflows', () => {
  it('merges main into staging after every push to main, and only ever pushes staging', () => {
    expect(sync.on.push?.branches).toContain('main')
    expect(branches(sync)).not.toContain('staging')
    const script = workflowScripts(sync)
    expect(script).toContain('git push origin origin/main:refs/heads/staging')
    expect(script).toContain('git push origin staging')
    expect(allText(sync)).not.toMatch(/git push[^\n]*:refs\/heads\/main|git push origin main/)
    expect(script).toContain(
      'git merge --no-ff --no-edit -m "chore: merge main into staging" origin/main'
    )
  })

  it('promotes by fast-forwarding main to a tested staging commit', () => {
    expect(promote.on).toHaveProperty('workflow_dispatch')
    expect(promote.on).not.toHaveProperty('push')
    const script = workflowScripts(promote)
    expect(script).toContain('git merge-base --is-ancestor origin/main origin/staging')
    expect(script).toContain(
      'if ! node scripts/ci-passed.mjs checks "$staging" staging "$CHECKS"; then'
    )
    const check = step(job(promote, 'promote'), 'Check staging can be promoted')
    expect(check.env).toEqual({
      GITHUB_TOKEN: expression('github.token'),
      CHECKS: CHECKS.join(' ')
    })
    expect(promote.permissions).toEqual({ contents: 'read', actions: 'read' })
    const checkout = job(promote, 'promote').steps?.find(each =>
      each.uses?.startsWith('actions/checkout@')
    )
    expect(checkout?.with?.['sparse-checkout']).toBeUndefined()
    expect(checkout?.with?.['fetch-depth']).toBe(0)
    expect(script).toContain('git push origin "$STAGING_SHA:refs/heads/main"')
    expect(allText(promote)).not.toMatch(/--force|\+refs|-f /)
  })

  it('pushes with the deploy key from the release environment, so the pushed branch runs CI and deploys', () => {
    for (const workflow of [sync, promote]) {
      const pushers = Object.values(workflow.jobs).filter(owner =>
        owner.steps?.some(
          candidate => candidate.with?.['ssh-key'] === expression('secrets.RELEASE_DEPLOY_KEY')
        )
      )
      expect(pushers.length).toBeGreaterThan(0)
      for (const pusher of pushers) expect(pusher.environment).toBe('release')
      expect(workflow.concurrency?.group).toMatch(/^[\w-]+$/)
      expect(workflow.concurrency?.['cancel-in-progress']).toBe(false)
    }
  })
})
