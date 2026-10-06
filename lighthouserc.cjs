module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm start",
      startServerReadyPattern: "Ready",
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/blog/",
        "http://localhost:3000/services/iv-therapy/",
        "http://localhost:3000/blog/iv-therapy-for-hangover/",
        "http://localhost:3000/areas-served/minato/roppongi/",
        "http://localhost:3000/watch/does-a-hangover-iv-really-help/",
        "http://localhost:3000/contact/",
        "http://localhost:3000/ja/",
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--headless --no-sandbox",
        preset: "desktop",
        // The accepted LeadConnector integration currently sets third-party cookies.
        skipAudits: ["color-contrast", "third-party-cookies"],
        // Score only this repo's code: tags injected via Google Tag Manager (e.g. the LeadConnector
        // chat widget) behave differently between runs and made the gate flaky.
        blockedUrlPatterns: ["*googletagmanager.com*", "*leadconnectorhq.com*", "*msgsndr.com*"],
      },
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "categories:performance": ["warn", { minScore: 0.5 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
}
