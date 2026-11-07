import { describe, expect, it } from 'vitest'
import { simulate } from './job-results'
import { job, step, type Workflow } from './workflows'

const workflowWith = (condition: string): Workflow => ({
  name: 'Small',
  on: { push: null },
  jobs: { build: { if: condition, steps: [{ name: 'Build', run: 'pnpm build' }] } }
})

const push = { github: { event_name: 'push' } }

describe('reading a workflow the simulator can’t play out fails loudly', () => {
  it('refuses a condition that calls a function GitHub has but the simulator doesn’t', () => {
    expect(() => simulate(workflowWith("hashFiles('pnpm-lock.yaml')"), push)).toThrow(
      "No hashFiles() in: success() && (hashFiles('pnpm-lock.yaml'))"
    )
  })

  it('refuses a condition it reads only part of', () => {
    expect(() => simulate(workflowWith("github.event_name == 'push')"), push)).toThrow(
      "Couldn't read all of: success() && (github.event_name == 'push'))"
    )
  })

  it('refuses to say whether a step runs, or what it gets, when the job has no such step', () => {
    const played = simulate(workflowWith("github.event_name == 'push'"), push)
    expect(played.stepRuns('build', 'Build')).toBe(true)
    expect(() => played.stepRuns('build', 'Deploy')).toThrow('build has no step Deploy')
    expect(() => played.stepEnv('build', 'Deploy')).toThrow('build has no step Deploy')
  })

  it('refuses a job or step the workflow doesn’t have', () => {
    const workflow = workflowWith('true')
    expect(step(job(workflow, 'build'), 'Build').run).toBe('pnpm build')
    expect(() => job(workflow, 'deploy')).toThrow('Small has no job deploy')
    expect(() => step(job(workflow, 'build'), 'Deploy')).toThrow('No step with id or name Deploy')
  })
})
