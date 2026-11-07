function robotsGroups(robots) {
  const groups = new Map()
  let agents = []
  let readingRules = false
  for (const line of robots.split(/\r?\n/)) {
    const match = line.replace(/#.*/, '').match(/^\s*([a-z-]+)\s*:\s*(.*?)\s*$/i)
    if (!match) continue
    const field = match[1].toLowerCase()
    if (field === 'user-agent') {
      if (readingRules) agents = []
      readingRules = false
      const agent = match[2].toLowerCase()
      agents.push(agent)
      if (!groups.has(agent)) groups.set(agent, [])
    } else if (field === 'allow' || field === 'disallow') {
      readingRules = true
      for (const agent of agents) groups.get(agent).push({ field, value: match[2] })
    }
  }
  return groups
}

export function blocksEverything(robots, userAgent = '*') {
  const groups = robotsGroups(robots)
  const rules = groups.get(userAgent.toLowerCase()) ?? groups.get('*') ?? []
  return rules.some(rule => rule.field === 'disallow' && rule.value === '/')
}
