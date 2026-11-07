import {
  closedOnMergeInto,
  closingReferences,
  gitHubApi,
  pullRequestOf,
  readEvent,
  runMain
} from './pull-request.mjs'

export const closingComment = pull =>
  `Closed by #${pull.number}, merged into \`${pull.base}\` as ${pull.mergeCommit.slice(0, 7)}. GitHub closes issues only for pull requests into the default branch, \`main\`, so this workflow does it for \`${closedOnMergeInto}\`. The change reaches Production with the next promotion.`

const pauseFor = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

const commitOf = commit => ({ id: commit.id, message: commit.message ?? '' })

export const commitsOf = event => {
  const pushed = (event.commits ?? []).filter(commit => commit?.id)
  if (pushed.length) return pushed.map(commitOf)
  return event.head_commit?.id ? [commitOf(event.head_commit)] : []
}

export const pullNamedBy = message => {
  const found = /\(#(\d+)\)$/.exec(message.split('\n')[0].trim())
  return found ? Number(found[1]) : null
}

export const mergedAs = (item, sha) =>
  Boolean(item?.merged_at) && item.base?.ref === closedOnMergeInto && item.merge_commit_sha === sha

export async function pullsMergedAs({ commit, repository, api, log, attempts, pause, wait }) {
  const named = pullNamedBy(commit.message)
  for (let attempt = 1; ; attempt++) {
    const listed = await api.pullsOfCommit(repository, commit.id)
    const merged = listed.filter(item => mergedAs(item, commit.id))
    if (merged.length || named === null) return merged
    const namedPull = listed.find(item => item.number === named)
    if (namedPull && namedPull.base?.ref !== closedOnMergeInto) return merged
    if (attempt >= attempts)
      throw new Error(
        `its subject names #${named}, but after ${attempts} tries GitHub still links no merge of #${named} into ${closedOnMergeInto} to it. Close the issues #${named} names by hand, or run this workflow again`
      )
    log(
      `GitHub doesn't link #${named}'s merge to ${commit.id.slice(0, 7)} yet; asking again in ${pause / 1000} s.`
    )
    await wait(pause)
  }
}

export async function closeNamedIssues({ pull, repository, api, log }) {
  const named = closingReferences(pull.body, repository)
  if (!named.length) log(`#${pull.number} names no issue with a closing keyword.`)
  const closed = []
  const failed = []
  for (const issue of named) {
    if (issue.repository) {
      log(
        `::notice::${issue.repository}#${issue.number} is in another repository, so close it by hand.`
      )
      continue
    }
    try {
      const state = await api.issueState(repository, issue.number)
      if (state === null) log(`::warning::#${issue.number} isn't an issue in ${repository}.`)
      else if (state === 'pull request')
        log(`::warning::#${issue.number} is a pull request, not an issue.`)
      else if (state === 'closed') log(`#${issue.number} is already closed.`)
      else {
        await api.comment(repository, issue.number, closingComment(pull))
        await api.close(repository, issue.number)
        log(`Closed #${issue.number}, which #${pull.number} names.`)
        closed.push(issue.number)
      }
    } catch (error) {
      log(`::error::Couldn't close #${issue.number}, which #${pull.number} names: ${error.message}`)
      failed.push(issue.number)
    }
  }
  return { closed, failed }
}

export async function closeIssuesOfPush({
  event,
  repository,
  api,
  log,
  attempts = 4,
  pause = 10_000,
  wait = pauseFor
}) {
  const closed = []
  let failures = 0
  if (event.ref !== `refs/heads/${closedOnMergeInto}`) {
    log(`The push is to ${event.ref}, not ${closedOnMergeInto}, so it closes nothing.`)
    return { closed, failures }
  }
  for (const commit of commitsOf(event)) {
    let pulls
    try {
      pulls = await pullsMergedAs({ commit, repository, api, log, attempts, pause, wait })
    } catch (error) {
      log(`::error::Couldn't find the pull request ${commit.id} merged: ${error.message}`)
      failures++
      continue
    }
    if (!pulls.length)
      log(
        `${commit.id.slice(0, 7)} isn't a pull request merged into ${closedOnMergeInto}, so it closes nothing.`
      )
    for (const item of pulls) {
      const pull = { ...pullRequestOf({ pull_request: item }), merged: true }
      const result = await closeNamedIssues({ pull, repository, api, log })
      closed.push(...result.closed)
      failures += result.failed.length
    }
  }
  return { closed, failures }
}

export async function main() {
  const environment = process.env
  const { failures } = await closeIssuesOfPush({
    event: readEvent(environment),
    repository: environment.GITHUB_REPOSITORY,
    api: gitHubApi({ token: environment.GITHUB_TOKEN, api: environment.GITHUB_API_URL }),
    log: line => console.log(line)
  })
  if (failures) {
    console.log(`::error::${failures} step(s) failed; the log above names each.`)
    process.exitCode = 1
  }
}

await runMain(import.meta.url, main)
