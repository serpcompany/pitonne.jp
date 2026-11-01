import type { Workflow, WorkflowJob } from './workflows'

type Value = string | number | boolean | null | Value[] | { [key: string]: Value }
type Call = (...values: Value[]) => Value
type Result = 'success' | 'failure' | 'skipped'

export type Scenario = {
  github: { [key: string]: Value }
  outputs?: Record<string, Record<string, string>>
  failing?: readonly string[]
  vars?: Record<string, string>
  secrets?: Record<string, string>
}

const statusCheck = /\b(always|success|failure|cancelled)\(\)/
const tokens = /\|\||&&|==|!=|[()!,]|'[^']*'|[\w.*-]+/g
const unwrapped = (text: string) => text.trim().replace(/^\$\{\{([\s\S]*)\}\}$/, '$1')

const isRecord = (value: Value): value is { [key: string]: Value } =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function lookUp(scope: Value, path: string): Value {
  return path.split('.').reduce<Value>((value, key) => {
    if (key === '*') return isRecord(value) ? Object.values(value) : []
    if (Array.isArray(value))
      return value.map(each => (isRecord(each) ? (each[key] ?? null) : null))
    return isRecord(value) ? (value[key] ?? null) : null
  }, scope)
}

function evaluate(text: string, scope: Value, calls: Record<string, Call>): Value {
  const expression = unwrapped(text)
  const parts = expression.match(tokens) ?? []
  let at = 0
  const either = (): Value => {
    let left = both()
    while (parts[at] === '||') {
      at++
      const right = both()
      left = left || right
    }
    return left
  }
  const both = (): Value => {
    let left = compared()
    while (parts[at] === '&&') {
      at++
      const right = compared()
      left = left && right
    }
    return left
  }
  const compared = (): Value => {
    const left = negated()
    const operator = parts[at]
    if (operator !== '==' && operator !== '!=') return left
    at++
    return (left === negated()) === (operator === '==')
  }
  const negated = (): Value => {
    if (parts[at] !== '!') return single()
    at++
    return !negated()
  }
  const single = (): Value => {
    const part = parts[at++] ?? ''
    if (part === '(') {
      const inner = either()
      at++
      return inner
    }
    if (part.startsWith("'")) return part.slice(1, -1)
    if (part === 'true' || part === 'false') return part === 'true'
    if (/^\d+$/.test(part)) return Number(part)
    if (parts[at] !== '(') {
      const found = lookUp(scope, part)
      return found === null && /^(secrets|vars)\./.test(part) ? '' : found
    }
    at++
    const given: Value[] = []
    while (at < parts.length && parts[at] !== ')') {
      given.push(either())
      if (parts[at] === ',') at++
    }
    at++
    const call = calls[part]
    if (!call) throw new Error(`No ${part}() in: ${expression}`)
    return call(...given)
  }
  const value = either()
  if (at !== parts.length) throw new Error(`Couldn't read all of: ${expression}`)
  return value
}

const functions: Record<string, Call> = {
  contains: (list, item) =>
    Array.isArray(list)
      ? list.includes(item)
      : String(list ?? '')
          .toLowerCase()
          .includes(String(item ?? '').toLowerCase()),
  startsWith: (text, start) => String(text ?? '').startsWith(String(start ?? '')),
  fromJSON: text => JSON.parse(String(text)) as Value
}

const stopsHere = (run = '') => {
  const lines = run
    .trim()
    .split('\n')
    .map(line => line.trim())
  return (
    lines.at(-1) === 'exit 1' && lines.every(line => line === 'exit 1' || line.startsWith('echo '))
  )
}

export function simulate(workflow: Workflow, scenario: Scenario) {
  const results: Record<string, Result> = {}
  const needed = (id: string) => [workflow.jobs[id]?.needs ?? []].flat()
  const before = (id: string): string[] => needed(id).flatMap(each => [each, ...before(each)])

  function resultOf(id: string): Result {
    results[id] ??= conclude(id)
    return results[id]
  }

  function scopeOf(id: string): { [key: string]: Value } {
    const scope: { [key: string]: Value } = {
      github: scenario.github,
      vars: scenario.vars ?? {},
      secrets: scenario.secrets ?? {},
      needs: Object.fromEntries(
        needed(id).map(each => [
          each,
          {
            result: resultOf(each),
            outputs: resultOf(each) === 'success' ? (scenario.outputs?.[each] ?? {}) : {}
          }
        ])
      )
    }
    const env = workflow.jobs[id]?.env ?? {}
    scope.env = Object.fromEntries(
      Object.entries(env).map(([name, value]) => [name, interpolate(String(value), scope)])
    )
    return scope
  }

  function callsOf(id: string): Record<string, Call> {
    const earlier = before(id).map(resultOf)
    return {
      ...functions,
      always: () => true,
      success: () => earlier.every(result => result === 'success'),
      failure: () => earlier.includes('failure'),
      cancelled: () => false
    }
  }

  function conclude(id: string): Result {
    const job: WorkflowJob = workflow.jobs[id]
    const scope = scopeOf(id)
    const condition = unwrapped(job.if ?? 'success()')
    const gated = statusCheck.test(condition) ? condition : `success() && (${condition})`
    if (!evaluate(gated, scope, callsOf(id))) return 'skipped'
    if (scenario.failing?.includes(id)) return 'failure'
    const stops = (job.steps ?? []).some(step => stopsHere(step.run) && stepRunsIn(id, step.if))
    return stops ? 'failure' : 'success'
  }

  function stepRunsIn(id: string, condition = 'success()') {
    const calls = { ...callsOf(id), success: () => true, failure: () => false }
    const text = unwrapped(condition)
    return Boolean(
      evaluate(statusCheck.test(text) ? text : `success() && (${text})`, scopeOf(id), calls)
    )
  }

  for (const id of Object.keys(workflow.jobs)) resultOf(id)
  return {
    results,
    stepRuns: (id: string, name: string) => {
      const step = workflow.jobs[id]?.steps?.find(
        each => each.name === name || each.id === name || each.run === name
      )
      if (!step) throw new Error(`${id} has no step ${name}`)
      return resultOf(id) !== 'skipped' && stepRunsIn(id, step.if)
    }
  }
}

const asText = (value: Value) => (value === null ? '' : String(value))

function interpolate(text: string, scope: Value): string {
  return text.replace(/\$\{\{([\s\S]*?)\}\}/g, (_, body: string) =>
    asText(evaluate(body, scope, functions))
  )
}
