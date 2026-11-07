# Exceptions to the rules

Every place a lint rule doesn't apply, and why. A rule is never switched off in the code it flags, so
the only exceptions are the ones a tool's config turns off, listed here.

## Rules turned off in a tool's config

A linter's config file can't hold a reason, so each rule it turns off is here. Add a row, with its
reason, in the pull request that turns another off.

| Where | What is off | Why |
| --- | --- | --- |
| `biome.json` | `noImgElement` | The site is a static export on Cloudflare Pages with `images.unoptimized: true`, so `next/image` can't optimize anything and would only change the markup |
| `biome.json`, for `src/components/shared/json-ld.tsx` | `noDangerouslySetInnerHtml` | The JSON-LD is the text of a `script` element, with `<` escaped as `\u003c` |
