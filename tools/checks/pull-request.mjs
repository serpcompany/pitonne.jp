import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export const checkNames = ['title', 'issue-link', 'fix-test', 'text']
export const closedOnMergeInto = 'staging'

const types = ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'build', 'ci', 'chore']
const conventional = new RegExp(`^(?:${types.join('|')})(?:\\([a-z0-9][a-z0-9-]*\\))?!?: \\S`)

export const isConventionalTitle = title => conventional.test(title)

export const titleRule = `A pull request's title is a Conventional Commit that names the outcome a user notices, such as "fix: Escape closes the Settings window". Start it with one of ${types.join(', ')}, then an optional scope in brackets, an optional !, a colon, and a space.`

export const noIssueReason = body => /^No issue: *\S.*$/im.exec(body)?.[0]

export const issueRule =
  'A pull request closes the issue it finishes, so an open issue always means work is left. Start the body with Closes #<number>, one line per issue, or say why there is none on a line of its own: No issue: <reason>. "Part of #N" and "Refs #N" close nothing.'

export const otherBase = (base, defaultBranch) =>
  base && defaultBranch && base !== defaultBranch
    ? `This pull request is based on ${base}, not ${defaultBranch}, and GitHub links a closing keyword only on a pull request into ${defaultBranch}. With Closes #<number> in its body, the check passes once it is retargeted, which GitHub does when its parent merges.`
    : ''

export const stagingNote = `GitHub links a closing keyword only on a pull request into the default branch, so on one into ${closedOnMergeInto} this check reads the keywords itself, and the Close issues workflow closes this repository's issues they name when the pull request merges (docs/agents/ci-pull-requests.md, Close issues).`

const quoteLine = /^[ \t]{0,3}>/
const startsABlock = /^[ \t]{0,3}(?:#{1,6}(?:[ \t]|$)|[-*+][ \t]|1[.)][ \t]|```|~~~)/

function withoutQuotes(text) {
  let quoting = false
  return text
    .split('\n')
    .map(line => {
      if (quoteLine.test(line)) quoting = true
      else if (!line.trim() || startsABlock.test(line)) quoting = false
      return quoting ? '' : line
    })
    .join('\n')
}

const whereGitHubLinksNothing = [
  /^[ \t]*(([`~])\2{2,})(?:(?<=~)[^\n]*|[^`\n]*)\n[\s\S]*?(?:^[ \t]*\1\2*[ \t]*$|(?![\s\S]))/gm,
  /<code\b[^>]*>[\s\S]*?<\/code>/gi,
  /(?<!`)(`+)(?!`)(?:(?!\n[ \t]*\n)[\s\S])*?(?<!`)\1(?!`)/g,
  /<!--[\s\S]*?-->/g,
  withoutQuotes
]
const closingKeyword =
  /(?<![\w-])(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?[ \t]+(?:([\w.-]+\/[\w.-]+)#|https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/issues\/|#)(\d{1,9})\b/gi

export function closingReferences(body, ownRepository = '') {
  const text = whereGitHubLinksNothing.reduce(
    (rest, pattern) => (typeof pattern === 'function' ? pattern(rest) : rest.replace(pattern, ' ')),
    body
  )
  const named = new Map()
  for (const [, short, linked, number] of text.matchAll(closingKeyword)) {
    const from = short ?? linked ?? ''
    const repository = from.toLowerCase() === ownRepository.toLowerCase() ? '' : from
    named.set(`${repository.toLowerCase()}#${number}`, { repository, number: Number(number) })
  }
  return [...named.values()]
}

const escapeRegExp = text => text.replace(/[\\^$.+()[\]{}|/]/g, '\\$&')

function expandBraces(pattern) {
  const open = pattern.indexOf('{')
  if (open === -1) return [pattern]
  let depth = 0
  let close = -1
  for (let index = open; index < pattern.length && close === -1; index++) {
    if (pattern[index] === '{') depth++
    if (pattern[index] === '}' && --depth === 0) close = index
  }
  if (close === -1) return [pattern]
  const options = []
  let start = open + 1
  depth = 0
  for (let index = open + 1; index < close; index++) {
    if (pattern[index] === '{') depth++
    if (pattern[index] === '}') depth--
    if (pattern[index] === ',' && depth === 0) {
      options.push(pattern.slice(start, index))
      start = index + 1
    }
  }
  options.push(pattern.slice(start, close))
  return options.flatMap(option =>
    expandBraces(`${pattern.slice(0, open)}${option}${pattern.slice(close + 1)}`)
  )
}

function globSource(pattern) {
  const segments = pattern.replace(/^\.\//, '').split('/')
  return segments
    .map((segment, position) => {
      const last = position === segments.length - 1
      if (segment === '**') return last ? '.*' : '(?:.*/)?'
      const source = [...segment]
        .map(character =>
          character === '*' ? '[^/]*' : character === '?' ? '[^/]' : escapeRegExp(character)
        )
        .join('')
      return last ? source : `${source}/`
    })
    .join('')
}

export const matchesAnyGlob = (patterns, path) =>
  patterns.some(pattern =>
    expandBraces(pattern).some(each => new RegExp(`^${globSource(each)}$`).test(path))
  )

const defaultTests = {
  patterns: ['**/*.{test,spec}.{ts,tsx,mts,cts,js,jsx,mjs,cjs}', '**/test_*.py', '**/*Tests.swift'],
  fixBranches: ['fix/']
}

const fixTitle = /^fix(?:\([^)]*\))?!?:/

export const isFix = (branch, title, fixBranches) =>
  fixBranches.some(prefix => branch.startsWith(prefix)) || fixTitle.test(title)

const fixRule =
  "A fix comes with its test: a pull request titled fix:, or from a fix branch, adds or changes the test that fails without the fix. If nothing can fail without this change (a typo, a workflow setting), it isn't a fix: give it another type, such as chore or docs."

export const fixWithoutTest = (branch, title, changed, tests) =>
  isFix(branch, title, tests.fixBranches) &&
  !changed.some(path => matchesAnyGlob(tests.patterns, path))

export const pullRequestLines = (title, body) =>
  `${title}\n${body}`.replaceAll('\r', '').replace(/\n+$/, '').split('\n')

const statedLocalPaths = /^Local paths: *[^ ]/i
const localPathsLine = /^Local paths:/i

export const localPathsExemption = lines =>
  lines.some(line => statedLocalPaths.test(line))
    ? lines.find(line => localPathsLine.test(line))
    : undefined

const webUrl = /\p{L}[\p{L}\p{N}+.-]*:\/\/[^\s<>"`)]+/gu
const whereAPathStarts = String.raw`(?:^|[^\p{L}\p{N}_.~/-])`
const namedHome = String.raw`/Users/[^/\s]+|/home/[^/\s]+`
const systemTemp = '/private/(?:tmp|var)/|/var/folders/'
const tmpFolder = String.raw`(?:^|[^\p{L}\p{N}_.~-])tmp/[\p{L}\p{N}._-]+`
const agentFolders = String.raw`[Ss]cratchpad|\.claude/worktrees/`
const windowsHome = String.raw`[Cc]:\\Users\\`
const localPath = new RegExp(
  `${whereAPathStarts}(?:${namedHome}|${systemTemp}|~/)|${tmpFolder}|${agentFolders}|${windowsHome}`,
  'u'
)

export const linesWithLocalPaths = lines =>
  lines.flatMap((line, index) =>
    localPath.test(line.replace(webUrl, '')) ? [{ number: index + 1, line }] : []
  )

export const localPathRule =
  "Readers can open only GitHub and the repository. Say what ran and what it showed, name only files in the repository, and attach images through GitHub. A PR about such paths adds a line 'Local paths: <reason>'."

const exemptAuthors = ['dependabot[bot]', 'renovate[bot]']
const promotionBranches = ['main', 'staging']

const exemptFromAll = pull => exemptAuthors.includes(pull.author)

export const exemptFromIssueLink = pull =>
  exemptFromAll(pull) ||
  pull.head.startsWith('release-please--') ||
  (pull.fromThisRepository &&
    promotionBranches.includes(pull.base) &&
    promotionBranches.includes(pull.head))

const pass = message => ({ passed: true, message })
const fail = message => ({ passed: false, message })
const pauseFor = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

export async function patiently(read, { attempts = 3, pause = 5000, wait = pauseFor } = {}) {
  for (let attempt = 1; ; attempt++) {
    const found = await read()
    if (found.length || attempt >= attempts) return found
    await wait(pause)
  }
}

function title(pull) {
  if (isConventionalTitle(pull.title)) return pass(`"${pull.title}" names its type.`)
  return fail(`"${pull.title}"\n\n${titleRule}`)
}

async function issuesNamedInto(pull, context) {
  const named = closingReferences(pull.body, context.repository)
  const elsewhere = named.filter(issue => issue.repository)
  const own = await Promise.all(
    named
      .filter(issue => !issue.repository)
      .map(async issue => ({
        number: issue.number,
        state: await context.api.issueState(context.repository, issue.number)
      }))
  )
  const byHand = elsewhere.map(
    issue =>
      `::warning::Close ${issue.repository}#${issue.number} by hand after the merge: the Close issues workflow closes only this repository's issues.`
  )
  if (!own.length) return fail(`${issueRule}\n\n${stagingNote}`)
  const wrong = own.flatMap(({ number, state }) => {
    if (state === null) return [`#${number} isn't an issue in ${context.repository}.`]
    if (state === 'pull request') return [`#${number} is a pull request, not an issue.`]
    return []
  })
  if (wrong.length) return fail(`${wrong.join('\n')}\n\n${issueRule}\n\n${stagingNote}`)
  const closes = own.map(({ number }) => `#${number}`).join(' ')
  if (own.every(({ state }) => state === 'closed'))
    return fail(
      `Every issue it names is already closed (${closes}), so it finishes none.\n\n${issueRule}\n\n${stagingNote}`
    )
  const closed = own
    .filter(({ state }) => state === 'closed')
    .map(({ number }) => `::warning::#${number} is already closed.`)
  return pass(
    [`Closes ${closes}, which the Close issues workflow closes when this merges into ${pull.base}.`]
      .concat(closed, byHand)
      .join('\n')
  )
}

async function issueLink(pull, context) {
  if (exemptFromIssueLink(pull))
    return pass('Exempt: a dependency update, a release, or a promotion.')
  const reason = noIssueReason(pull.body)
  if (reason) return pass(reason)
  if (pull.base === 'main' && context.defaultBranch === 'staging') {
    const named = closingReferences(pull.body, context.repository)
    if (named.length) {
      const issues = named.map(issue => `${issue.repository}#${issue.number}`).join(' ')
      return pass(
        `::warning::GitHub won't close ${issues} on a merge into main. Close it by hand after the merge.`
      )
    }
  }
  if (pull.base === closedOnMergeInto && context.defaultBranch !== closedOnMergeInto) {
    return issuesNamedInto(pull, context)
  }
  const linked = await patiently(
    () => context.api.closingIssues(context.repository, pull.number),
    context
  )
  if (linked.length) return pass(`Closes ${linked.map(number => `#${number}`).join(' ')}`)
  const stacked = otherBase(pull.base, context.defaultBranch)
  return fail(stacked ? `${issueRule}\n\n${stacked}` : issueRule)
}

async function fixTest(pull, context) {
  if (!isFix(pull.head, pull.title, context.tests.fixBranches)) return pass('Not a fix.')
  const changed = await context.api.changedFiles(context.repository, pull.number)
  if (!fixWithoutTest(pull.head, pull.title, changed, context.tests)) return pass('Changes a test.')
  return fail(`Changes no test:\n${changed.join('\n')}\n\n${fixRule}`)
}

function noLocalPaths(pull) {
  const lines = pullRequestLines(pull.title, pull.body)
  const exemption = localPathsExemption(lines)
  if (exemption) return pass(`Exempt: ${exemption}`)
  const found = linesWithLocalPaths(lines)
  if (!found.length) return pass('No local paths in the title or body.')
  const named = found.map(
    ({ number, line }) =>
      `::error::Local path in the PR text (line ${number}): ${Array.from(line).slice(0, 160).join('')}`
  )
  return fail([...named, `::error::${localPathRule}`].join('\n'))
}

export async function runCheck(name, context) {
  if (!checkNames.includes(name)) return fail(`Run it as one of: ${checkNames.join(', ')}.`)
  const pull = context.pull
  if (!pull) return fail('This event has no pull request to check.')
  if (exemptFromAll(pull)) return pass(`Exempt: opened by ${pull.author}.`)
  if (name === 'title') return title(pull)
  if (name === 'issue-link') return issueLink(pull, context)
  if (name === 'text') return noLocalPaths(pull)
  return fixTest(pull, context)
}

export function pullRequestOf(event) {
  const pull = event.pull_request
  if (!pull) return null
  return {
    number: pull.number,
    title: pull.title,
    body: pull.body ?? '',
    author: pull.user.login,
    base: pull.base.ref,
    head: pull.head.ref,
    fromThisRepository: pull.head.repo?.full_name === pull.base.repo.full_name,
    merged: pull.merged === true,
    mergeCommit: pull.merge_commit_sha
  }
}

export function testsOf(folder) {
  const file = join(folder, 'verify.json')
  const written = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
  return {
    patterns: written.tests?.patterns ?? defaultTests.patterns,
    fixBranches: written.tests?.fixBranches ?? defaultTests.fixBranches
  }
}

const retryAfter = [5, 15]

export function gitHubApi({ token, api = 'https://api.github.com', pause = pauseFor }) {
  async function call(method, path, body, { retry = true } = {}) {
    for (let attempt = 0; ; attempt++) {
      const response = await fetch(`${api}${path}`, {
        method,
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          ...(body ? { 'Content-Type': 'application/json' } : {})
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(30_000)
      }).catch(error => ({ ok: false, status: 0, error }))
      const retryable =
        retry && (response.status === 0 || response.status === 429 || response.status >= 500)
      if (response.ok || !retryable || attempt >= retryAfter.length) return response
      await pause(retryAfter[attempt] * 1000)
    }
  }
  async function answer(method, path, body, options) {
    const response = await call(method, path, body, options)
    if (!response.ok) {
      const why = response.status
        ? `returned ${response.status}`
        : `got no answer (${response.error})`
      throw new Error(`${method} ${path} ${why}`)
    }
    return response
  }
  return {
    async issueState(repository, number) {
      const response = await call('GET', `/repos/${repository}/issues/${number}`)
      if (response.status === 404 || response.status === 410) return null
      if (!response.ok)
        throw new Error(`GET /repos/${repository}/issues/${number} returned ${response.status}`)
      const issue = await response.json()
      return issue.pull_request ? 'pull request' : issue.state
    },
    async closingIssues(repository, number) {
      const [owner, name] = repository.split('/')
      const query =
        'query($owner: String!, $name: String!, $number: Int!) { repository(owner: $owner, name: $name) { pullRequest(number: $number) { closingIssuesReferences(first: 25) { nodes { number } } } } }'
      const found = await (
        await answer('POST', '/graphql', { query, variables: { owner, name, number } })
      ).json()
      return (found.data?.repository?.pullRequest?.closingIssuesReferences?.nodes ?? []).map(
        node => node.number
      )
    },
    async changedFiles(repository, number) {
      const files = []
      for (let page = 1; page <= 30; page++) {
        const listed = await (
          await answer(
            'GET',
            `/repos/${repository}/pulls/${number}/files?per_page=100&page=${page}`
          )
        ).json()
        files.push(...listed.filter(file => file.status !== 'removed').map(file => file.filename))
        if (listed.length < 100) break
      }
      return files
    },
    async pullsOfCommit(repository, sha) {
      return (await answer('GET', `/repos/${repository}/commits/${sha}/pulls?per_page=100`)).json()
    },
    async comment(repository, number, body) {
      await answer(
        'POST',
        `/repos/${repository}/issues/${number}/comments`,
        { body },
        { retry: false }
      )
    },
    async close(repository, number) {
      await answer('PATCH', `/repos/${repository}/issues/${number}`, {
        state: 'closed',
        state_reason: 'completed'
      })
    }
  }
}

export const readEvent = environment =>
  JSON.parse(readFileSync(environment.GITHUB_EVENT_PATH, 'utf8'))

export async function runMain(moduleUrl, main) {
  if (process.argv[1] && moduleUrl === pathToFileURL(process.argv[1]).href) {
    await main(process.argv.slice(2))
  }
}

export async function main(argv) {
  const environment = process.env
  const event = readEvent(environment)
  const verdict = await runCheck(argv[0], {
    pull: pullRequestOf(event),
    repository: environment.GITHUB_REPOSITORY,
    defaultBranch: event.repository.default_branch,
    tests: testsOf(process.cwd()),
    api: gitHubApi({ token: environment.GITHUB_TOKEN ?? '', api: environment.GITHUB_API_URL }),
    attempts: 3,
    pause: 5000
  })
  console.log(verdict.message)
  process.exitCode = verdict.passed ? 0 : 1
}

await runMain(import.meta.url, main)
