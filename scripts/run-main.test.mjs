import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { runMain as runChecksMain } from '../tools/checks/pull-request.mjs'
import { runMain } from './run-main.mjs'

const started = [...process.argv]
const script = path.resolve('scripts/some-script.mjs')

afterEach(() => {
  process.argv = [...started]
})

describe.each([
  ['scripts', runMain],
  ['the pull request checks, which a sparse checkout runs alone', runChecksMain]
])('running a script’s main, as %s do', (_, run) => {
  async function argumentsGiven(argv) {
    process.argv = argv
    const given = []
    await run(pathToFileURL(script).href, async args => {
      given.push(args)
    })
    return given
  }

  it('runs main with the arguments after the script when node was started with that script', async () => {
    const given = await argumentsGiven([process.execPath, script, 'staging', 'abc'])
    expect(given).toEqual([['staging', 'abc']])
  })

  it('runs nothing when another module imports the script, or node was started with no script', async () => {
    const other = path.resolve('scripts/other.mjs')
    expect(await argumentsGiven([process.execPath, other])).toEqual([])
    expect(await argumentsGiven([process.execPath])).toEqual([])
  })
})
