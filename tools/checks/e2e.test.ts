import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, test } from 'vitest'
import config from '../../playwright.config'
import { job, readWorkflow, step } from './workflows'

const folder = 'e2e'
const files = fs.readdirSync(folder).filter(name => name.endsWith('.ts'))
const specs = files.filter(name => name.endsWith('.spec.ts'))
const read = (name: string) => fs.readFileSync(path.join(folder, name), 'utf8')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, string>
  devDependencies: Record<string, string>
}

describe('the browser journeys', () => {
  it('retry nothing, and run every journey at a desktop and a phone width', () => {
    expect(config.retries).toBe(0)
    expect(config.projects?.map(project => project.name)).toEqual(['desktop', 'phone'])
    expect(config.testDir).toBe(folder)
    expect(specs.length).toBeGreaterThan(2)
  })

  it('run against out/ served as Pages serves it, never against a server already running', () => {
    expect(packageJson.scripts.preview).toBe('wrangler pages dev out')
    expect(packageJson.scripts['test:e2e']).toBe('playwright test')
    const server = [config.webServer].flat()[0]
    expect(server?.command).toMatch(/^pnpm preview --ip 127\.0\.0\.1 --port \d+$/)
    expect(server?.reuseExistingServer).toBe(false)
  })

  it('serve with the wrangler the deploy uploads with, and pin Playwright to its browsers', () => {
    const deploy = step(job(readWorkflow('deploy.yml'), 'deploy'), 'deploy')
    expect(packageJson.devDependencies.wrangler).toBe(deploy.with?.wranglerVersion)
    expect(packageJson.devDependencies.playwright).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it("take the runner from playwright, since next's optional peer @playwright/test would change the built site's JavaScript", () => {
    expect(packageJson.devDependencies).not.toHaveProperty('@playwright/test')
    expect(fs.readFileSync('pnpm-lock.yaml', 'utf8')).not.toMatch(
      /^ {2}next@[^:]*@playwright\/test/m
    )
  })

  test.each(
    specs
  )('%s takes test and expect from the fixtures, which fail on any console or page error', name => {
    const imports = [...read(name).matchAll(/from '([^']+)'/g)].map(found => found[1])
    expect(imports).toContain('./fixtures')
    expect(read(name)).not.toMatch(/import \{[^}]*\btest\b[^}]*\} from '@?playwright\/test'/)
  })

  test.each(files)('%s waits for conditions, never for a fixed time', name => {
    expect(read(name)).not.toMatch(/waitForTimeout|setTimeout|\bsleep\(|\.only\(/)
  })

  it('fail a journey on a console error or an uncaught page error', () => {
    const fixtures = read('fixtures.ts')
    expect(fixtures).toContain("message.type() === 'error'")
    expect(fixtures).toContain("page.on('pageerror'")
    expect(fixtures).toContain('{ auto: true }')
  })
})
