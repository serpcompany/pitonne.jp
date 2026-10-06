// The CMS is a single-page app: only /keystatic/ is exported, and public/_redirects serves it for every
// /keystatic/* path so Keystatic's own router can read the URL. Dynamic params stay allowed so the dev server
// (`pnpm cms`) also serves deep /keystatic/* URLs on reload.

export function generateStaticParams() {
  return [{ params: [] }]
}

export default function KeystaticPage() {
  return null
}
