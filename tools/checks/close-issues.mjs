import {
  closedOnMergeInto,
  closingReferences,
  gitHubApi,
  isMain,
  pullRequestOf,
  readEvent
} from './pull-request.mjs'

export const closingComment = pull =>
  `Closed by #${pull.number}, merged into \`${pull.base}\`${pull.mergeCommit ? ` as ${pull.mergeCommit.slice(0, 7)}` : ''}. GitHub closes issues only for pull requests into the default branch, \`main\`, so this workflow does it for \`${closedOnMergeInto}\`. The change reaches Production with the next promotion.`

export const commitsOf = event => {
  const pushed = (event.commits ?? []).map(commit => commit.id).filter(Boolean)
  if (pushed.length) return pushed
  return event.head_commit?.id ? [event.head_commit.id] : []
}

export const mergedAs = (item, sha) =>
  Boolean(item?.merged_at) && item.base?.ref === closedOnMergeInto && item.merge_commit_sha === sha

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

export async function closeIssuesOfPush({ event, repository, api, log }) {
  const closed = []
  let failures = 0
  if (event.ref !== `refs/heads/${closedOnMergeInto}`) {
    log(
      `The push is to ${event.ref ?? 'no branch'}, not ${closedOnMergeInto}, so it closes nothing.`
    )
    return { closed, failures }
  }
  for (const sha of commitsOf(event)) {
    let pulls
    try {
      pulls = (await api.pullsOfCommit(repository, sha)).filter(item => mergedAs(item, sha))
    } catch (error) {
      log(`::error::Couldn't list the pull requests of ${sha}: ${error.message}`)
      failures++
      continue
    }
    if (!pulls.length)
      log(
        `${sha.slice(0, 7)} isn't a pull request merged into ${closedOnMergeInto}, so it closes nothing.`
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

if (isMain(import.meta.url)) {
  const environment = process.env
  const event = readEvent(environment)
  const { failures } = await closeIssuesOfPush({
    event,
    repository: environment.GITHUB_REPOSITORY ?? event.repository?.full_name ?? '',
    api: gitHubApi({ token: environment.GITHUB_TOKEN ?? '', api: environment.GITHUB_API_URL }),
    log: line => console.log(line)
  })
  if (failures) {
    console.log(`::error::${failures} step(s) failed; the log above names each.`)
    process.exit(1)
  }
}
