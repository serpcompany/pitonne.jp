export const DEPLOY_ENVIRONMENTS = ['production', 'staging', 'preview'] as const
export type DeployEnvironment = (typeof DEPLOY_ENVIRONMENTS)[number]

export const SITE_AUDITOR = 'AhrefsSiteAudit'

const ORIGINS: Record<DeployEnvironment, string> = {
  production: 'https://pitonne.jp',
  staging: 'https://staging.pitonne.jp',
  preview: 'https://pitonne.jp'
}

type DeployEnv = Record<string, string | undefined>

const isDeployEnvironment = (value: string | undefined): value is DeployEnvironment =>
  DEPLOY_ENVIRONMENTS.some(environment => environment === value)

export const declaresDeployEnvironment = (env: DeployEnv = process.env) =>
  Boolean(env.DEPLOY_ENV || env.NEXT_PUBLIC_DEPLOY_ENV)

export function deployEnvironment(env: DeployEnv = process.env): DeployEnvironment {
  const declared = new Set([env.DEPLOY_ENV, env.NEXT_PUBLIC_DEPLOY_ENV].filter(Boolean))
  const [value] = declared
  return declared.size === 1 && isDeployEnvironment(value) ? value : 'preview'
}

export const isIndexable = (environment = deployEnvironment()) =>
  environment === 'production' || environment === 'staging'

export const hasAnalytics = (environment = deployEnvironment()) => environment === 'production'

export const hasPasswordGate = (environment = deployEnvironment()) => environment === 'staging'

export const siteOrigin = (environment = deployEnvironment()) => ORIGINS[environment]
