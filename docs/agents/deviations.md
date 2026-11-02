# Where this repository differs from SERP's standards

Every place pitonne.jp does something other than a SERP standard asks, one line each, with the doc
that holds the reason. [`AGENTS.md`](../../AGENTS.md#where-this-differs-from-serps-standards)
routes here, and in this repository this list wins over the standard it names. A difference marked
**open** waits for the owner's decision; until then the site keeps it.

## Hosting and layout

- **A static export on Cloudflare Pages,** not Workers through OpenNext
  ([ADR 0003](../adr/0003-static-export-on-cloudflare-pages.md)).
- **Code in `src/` at the root,** with `content/`, `public/` and `keystatic.config.ts` beside it,
  not in `apps/web/` ([ADR 0004](../adr/0004-repository-layout.md)).
- **No Sentry:** error reporting waits for the owner's decision
  ([`environments.md`](environments.md#what-each-environment-builds)).

## Branches, deploys and CI

- **CMS saves go straight to Production:** Keystatic commits to `main`, which deploys as soon as
  it builds, waiting for no check at all
  ([`gitflow.md`](../gitflow.md#content-cms-saves-go-straight-to-main)).
- **Deploys upload the branch tip,** not the commit whose checks passed, so a content deploy also
  ships any code on its branch whose checks haven't finished, where SERP's
  [CI Workflows](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/ci-workflows.md#deploys-wait-for-the-check)
  skip a deploy that isn't the tip ([`ci-deploys.md`](ci-deploys.md#deployyml)).
- **`main` is merged back into `staging` by a direct push** with the deploy key (Sync staging), not
  through a `main` → `staging` pull request merged with a merge commit
  ([`gitflow.md`](../gitflow.md#content-cms-saves-go-straight-to-main)).
- **GitHub's default branch stays `main`** while pull requests target `staging`, because Keystatic
  Cloud opens on the default branch ([`gitflow.md`](../gitflow.md#why-main-stays-the-default-branch)).
- **Vendored pull request checks:** serp's action is private, so `tools/checks/pull-request.mjs`
  runs its rules, with `issue-link` accepting `staging`, skipping closing keywords in a quote or a
  `<code>` tag, and failing when a pull request names only closed issues; the
  `ci-pull-request-checks` alignment rule stays failing
  ([`ci-pull-requests.md`](ci-pull-requests.md#pull-request)).
- **The code review reviews a pull request that changes its own workflow,** with that pull
  request's copy. SERP's skips one, since its action runs only with the default branch's workflow;
  this one runs on the job's own token ([`ci-pull-requests.md`](ci-pull-requests.md#code-review)).

## URLs and languages

- **Trailing slashes:** on Production and previews, the slashed form of a path
  `public/_routes.json` excludes answers 404, and `/keystatic/*` is left as requested
  ([`hosts.md`](hosts.md#exceptions-to-the-trailing-slash-standard)).
- **English text under `/ja/`:** the videos show a video's English text where it has no Japanese,
  and a missing `/ja/` URL gets the English 404, where Localization's
  [Content](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/localization.md#content)
  never serves an English body under `/ja/`. **Open**
  ([`docs/i18n.md`](../i18n.md#pages-with-english-text-under-ja)).
- **The language switcher is one link** to the other language, falling back to its blog index, not
  the menu SERP's
  [Language Switcher](https://github.com/serpcompany/serp/blob/main/docs/engineering/websites/features/language-switcher.md#behavior)
  describes. **Open** ([Languages](../product/languages.md#the-language-switcher)).
- **The locale config is a bare list of codes,** and `ja` is written into `src/lib/seo.ts`,
  `src/lib/data/routes.ts` and the sitemaps, as Localization's
  [Reference implementation](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/localization.md#reference-implementation)
  notes ([`docs/i18n.md`](../i18n.md#architecture)).
- **No translation review fields:** Japanese that an AI wrote is flagged in the pull request for
  native review instead ([`content.md`](content.md#japanese-copy)).

## UI

- **shadcn's `new-york` style on Radix,** not `base-nova` on Base UI
  ([`code.md`](code.md#ui-kit)).
- **Hex colors in the components,** such as the brand green `#7A8F87`, where SERP's
  [shadcn First](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/shadcn-first.md#rules)
  styles only through theme tokens ([`code.md`](code.md#ui-kit)).
