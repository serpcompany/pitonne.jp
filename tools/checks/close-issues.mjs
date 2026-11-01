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

export async function closeNamedIssues({ pull, repository, api, log }) {
  if (!pull?.merged) {
    log('The pull request closed without merging, so it closes no issue.')
    return []
  }
  if (pull.base !== closedOnMergeInto) {
    log(
      `The pull request merged into ${pull.base}, not ${closedOnMergeInto}, so GitHub closes its issues itself.`
    )
    return []
  }
  const named = closingReferences(pull.body, repository)
  if (!named.length) log('The description names no issue with a closing keyword.')
  const closed = []
  for (const issue of named) {
    if (issue.repository) {
      log(
        `::notice::${issue.repository}#${issue.number} is in another repository, so close it by hand.`
      )
      continue
    }
    const state = await api.issueState(repository, issue.number)
    if (state === null) log(`::warning::#${issue.number} isn't an issue in ${repository}.`)
    else if (state === 'pull request')
      log(`::warning::#${issue.number} is a pull request, not an issue.`)
    else if (state === 'closed') log(`#${issue.number} is already closed.`)
    else {
      await api.comment(repository, issue.number, closingComment(pull))
      await api.close(repository, issue.number)
      log(`Closed #${issue.number}.`)
      closed.push(issue.number)
    }
  }
  return closed
}

if (isMain(import.meta.url)) {
  const environment = process.env
  const event = readEvent(environment)
  await closeNamedIssues({
    pull: pullRequestOf(event),
    repository: environment.GITHUB_REPOSITORY ?? event.repository?.full_name ?? '',
    api: gitHubApi({ token: environment.GITHUB_TOKEN ?? '', api: environment.GITHUB_API_URL }),
    log: line => console.log(line)
  }).catch(error => {
    console.log(`::error::${error.message}`)
    process.exit(1)
  })
}
