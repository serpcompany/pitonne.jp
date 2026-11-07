import { isValidElement, type ReactElement, type ReactNode } from 'react'
import LocaleLayout from '@/app/[locale]/layout'
import { Header } from '@/components/header'
import type { Locale } from '@/lib/i18n/config'
import { defined } from '@/test/defined'

export type HeaderProps = Parameters<typeof Header>[0]

function findElement(node: ReactNode, type: unknown): ReactElement | undefined {
  if (Array.isArray(node)) return node.map(child => findElement(child, type)).find(Boolean)
  if (!isValidElement(node)) return undefined
  if (node.type === type) return node
  return findElement((node.props as { children?: ReactNode }).children, type)
}

export async function siteHeader(
  locale: Locale,
  languageSwitcherPath?: string
): Promise<ReactElement<HeaderProps>> {
  const layout = await LocaleLayout({
    children: null,
    params: Promise.resolve({ locale }),
    languageSwitcherPath
  })
  return defined(findElement(layout, Header)) as ReactElement<HeaderProps>
}
