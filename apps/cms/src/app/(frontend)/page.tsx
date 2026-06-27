import Link from "next/link"

export default function HomePage() {
  return (
    <main className="cms-home">
      <section>
        <p className="eyebrow">Pitonne</p>
        <h1>Content Management</h1>
        <p>Payload CMS for blog posts, selected page copy, and media uploads.</p>
        <Link href="/admin">Open admin</Link>
      </section>
    </main>
  )
}
