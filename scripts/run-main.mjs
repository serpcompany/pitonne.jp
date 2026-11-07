import { pathToFileURL } from 'node:url'

export async function runMain(moduleUrl, main) {
  if (process.argv[1] && moduleUrl === pathToFileURL(process.argv[1]).href) {
    await main(process.argv.slice(2))
  }
}
