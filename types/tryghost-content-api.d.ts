declare module "@tryghost/content-api" {
  export interface GhostContentAPIOptions {
    url: string
    key: string
    version: string
  }

  export default class GhostContentAPI {
    posts: {
      browse(options?: Record<string, unknown>): Promise<unknown[]>
      read(
        data: Record<string, unknown>,
        options?: Record<string, unknown>
      ): Promise<unknown>
    }

    pages: {
      read(data: Record<string, unknown>): Promise<unknown>
    }

    constructor(options: GhostContentAPIOptions)
  }
}
