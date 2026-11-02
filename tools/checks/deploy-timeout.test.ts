import { afterEach, describe, expect, it, vi } from 'vitest'
import * as hostSmoke from '../../scripts/smoke-canonical-host.mjs'
import * as environmentSmoke from '../../scripts/smoke-environment.mjs'
import { job, readWorkflow } from './workflows'

const MINUTE = 60_000
const REST_OF_THE_JOB = 10 * MINUTE
const deploymentUrl = 'https://d49a67b6.pitonne-jp.pages.dev'
const aliasUrl = (branch: string) => `https://${branch}.pitonne-jp.pages.dev`

function everyRequestTimesOut() {
  let clock = 0
  let lastUrl: string | undefined
  const probeFn = async (check: string | { url: string }) => {
    const url = typeof check === 'string' ? check : check.url
    if (url === lastUrl) clock += hostSmoke.RETRY_DELAY_MS
    lastUrl = url
    clock += hostSmoke.REQUEST_TIMEOUT_MS
    throw new Error('The request timed out.')
  }
  return { options: { probeFn, now: () => clock, delayMs: 0 }, elapsed: () => clock }
}

type RunChecks = (
  checks: unknown[],
  options: ReturnType<typeof everyRequestTimesOut>['options']
) => Promise<boolean>

async function hostSmokeWorstCase() {
  const timing = everyRequestTimesOut()
  const runChecks = hostSmoke.runChecks as RunChecks
  await runChecks(hostSmoke.smokeChecks({ deploymentUrl, marker: 'abc1234' }), timing.options)
  return timing.elapsed()
}

async function environmentSmokeWorstCase(environment: string, origins: string[]) {
  const timing = everyRequestTimesOut()
  const checks = origins.flatMap(origin => environmentSmoke.environmentChecks(environment, origin))
  await (environmentSmoke.runChecks as RunChecks)(checks, timing.options)
  return timing.elapsed()
}

async function smokeWorstCases() {
  return {
    production:
      (await hostSmokeWorstCase()) +
      (await environmentSmokeWorstCase('production', [
        'https://pitonne-jp.pages.dev',
        'https://pitonne.jp'
      ])),
    staging: await environmentSmokeWorstCase('staging', [
      aliasUrl('staging'),
      deploymentUrl,
      'https://staging.pitonne.jp'
    ]),
    preview: await environmentSmokeWorstCase('preview', [aliasUrl('pr-12'), deploymentUrl])
  }
}

describe('the deploy job’s time limit', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('leaves ten minutes for checkout, install, build and upload after the smoke tests’ worst case, every request timing out', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const worst = await smokeWorstCases()
    const limit = (job(readWorkflow('deploy.yml'), 'deploy')['timeout-minutes'] ?? 0) * MINUTE
    expect(worst.production).toBe(21.5 * MINUTE)
    for (const [environment, smoke] of Object.entries(worst)) {
      expect(smoke + REST_OF_THE_JOB, environment).toBeLessThanOrEqual(limit)
    }
  })
})
