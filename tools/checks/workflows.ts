import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

export type WorkflowStep = {
  name?: string
  id?: string
  if?: string
  uses?: string
  run?: string
  env?: Record<string, string>
  with?: Record<string, string | number | boolean>
}

type WorkflowConcurrency = {
  group: string
  'cancel-in-progress'?: boolean | string
}

export type WorkflowJob = {
  name?: string
  needs?: string | string[]
  if?: string
  environment?: string
  permissions?: Record<string, string>
  concurrency?: WorkflowConcurrency
  outputs?: Record<string, string>
  env?: Record<string, string>
  uses?: string
  with?: Record<string, string | number | boolean>
  secrets?: Record<string, string> | 'inherit'
  steps?: WorkflowStep[]
}

type WorkflowTrigger = { branches?: string[] } | null

export type Workflow = {
  name: string
  on: Record<string, WorkflowTrigger>
  concurrency?: WorkflowConcurrency
  permissions?: Record<string, string>
  jobs: Record<string, WorkflowJob>
}

export function readWorkflow(file: string): Workflow {
  return parse(
    fs.readFileSync(path.join(process.cwd(), '.github', 'workflows', file), 'utf8')
  ) as Workflow
}

export function job(workflow: Workflow, id: string): WorkflowJob {
  const found = workflow.jobs[id]
  if (!found) throw new Error(`${workflow.name} has no job ${id}`)
  return found
}

export function step(owner: WorkflowJob, idOrName: string): WorkflowStep {
  const found = owner.steps?.find(
    candidate => candidate.id === idOrName || candidate.name === idOrName
  )
  if (!found) throw new Error(`No step with id or name ${idOrName}`)
  return found
}

export function stepsAfter(owner: WorkflowJob, idOrName: string): WorkflowStep[] {
  const steps = owner.steps ?? []
  return steps.slice(steps.indexOf(step(owner, idOrName)) + 1)
}

export function stepIndex(owner: WorkflowJob, idOrName: string): number {
  return (owner.steps ?? []).indexOf(step(owner, idOrName))
}

export function needs(owner: WorkflowJob): string[] {
  return [owner.needs ?? []].flat()
}

export function scripts(owner: WorkflowJob): string {
  return (owner.steps ?? []).flatMap(candidate => (candidate.run ? [candidate.run] : [])).join('\n')
}

export function workflowScripts(workflow: Workflow): string {
  return Object.values(workflow.jobs).map(scripts).join('\n')
}

export function branches(workflow: Workflow): string[] {
  return Object.values(workflow.on).flatMap(trigger => trigger?.branches ?? [])
}

export function textValues(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(textValues)
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, entry]) => [key, ...textValues(entry)])
  }
  return []
}

export function allText(value: unknown): string {
  return textValues(value).join('\n')
}
