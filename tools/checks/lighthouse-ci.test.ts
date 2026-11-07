import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { job, readWorkflow } from './workflows'

type LighthouseConfig = {
  ci: {
    collect: { url: string[]; settings: { skipAudits: string[] } }
    assert: { assertions: Record<string, unknown> }
  }
}

const root = process.cwd()
const lighthouseConfig = createRequire(import.meta.url)(
  path.join(root, 'lighthouserc.cjs')
) as LighthouseConfig

describe('Lighthouse CI setup', () => {
  it("runs Lighthouse CI from a package script in CI's lighthouse job, on the export test built", () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>
      devDependencies?: Record<string, string>
    }

    expect(packageJson.scripts?.['test:lighthouse']).toContain('lhci autorun')
    expect(packageJson.devDependencies).toHaveProperty('@lhci/cli')
    const lighthouse = job(readWorkflow('ci.yml'), 'lighthouse')
    expect(lighthouse.steps?.map(step => step.run)).toContain('pnpm test:lighthouse')
    expect(lighthouse.needs).toEqual(['changes', 'test'])
    expect(
      lighthouse.steps?.find(step => step.uses?.startsWith('actions/download-artifact@'))?.with
    ).toEqual({
      name: 'site-production',
      path: 'out'
    })
    expect(job(readWorkflow('ci.yml'), 'test').steps?.map(step => step.run)).not.toContain(
      'pnpm test:lighthouse'
    )
  })

  it('audits the home page and blog with the agreed skipped audits and best-practices threshold', () => {
    const { collect, assert } = lighthouseConfig.ci

    expect(collect.url).toEqual(
      expect.arrayContaining(['http://localhost:3000/', 'http://localhost:3000/blog/'])
    )
    expect(collect.settings.skipAudits).toEqual(['color-contrast', 'third-party-cookies'])
    expect(assert.assertions['categories:best-practices']).toEqual(['error', { minScore: 0.95 }])
    expect(JSON.stringify(lighthouseConfig)).not.toContain('inspector-issues')
    expect(JSON.stringify(lighthouseConfig)).not.toContain('errors-in-console')
  })
})
