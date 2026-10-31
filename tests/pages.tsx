import type { ReactElement } from "react"
import AboutPage from "@/app/[locale]/about/page"
import AreaPage from "@/app/[locale]/areas-served/[ward]/[area]/page"
import WardPage from "@/app/[locale]/areas-served/[ward]/page"
import AreasServedPage from "@/app/[locale]/areas-served/page"
import BlogPostPage from "@/app/[locale]/blog/[post]/page"
import BlogCategoryPage from "@/app/[locale]/blog/category/[category]/page"
import BlogPage from "@/app/[locale]/blog/page"
import ContactPage from "@/app/[locale]/contact/page"
import DisclaimerPage from "@/app/[locale]/legal/disclaimer/page"
import LegalPage from "@/app/[locale]/legal/page"
import PrivacyPolicyPage from "@/app/[locale]/legal/privacy-policy/page"
import TermsConditionsPage from "@/app/[locale]/legal/terms-conditions/page"
import HomePage from "@/app/[locale]/page"
import ServicePage from "@/app/[locale]/services/[service]/page"
import ServicesPage from "@/app/[locale]/services/page"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { getAllAreas, wards } from "@/lib/data/areas"
import { getAllBlogPosts, getAllCategories } from "@/lib/data/blog-posts"
import { localizedRoute } from "@/lib/data/routes"
import { getServiceCategorySections, services } from "@/lib/data/services"
import { type Locale, locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

export type PageCase = [name: string, locale: Locale, page: () => Promise<ReactElement>]
type NamedPage = [name: string, page: () => Promise<ReactElement>]

const firstArea = getAllAreas()[0]
const parentService = services.find((service) => service.kind === "parent")!
const leafService = services.find((service) => service.kind === "leaf")!

export function siteHeader(locale: Locale): ReactElement {
  const serviceNavigation = getServiceCategorySections(locale).map((section) => ({
    name: section.title,
    href: section.href,
    items: section.services.map((service) => ({
      name: service.name,
      href: localizedRoute(service.canonicalPath, locale),
    })),
  }))

  return <Header locale={locale} dict={getDictionary(locale)} serviceNavigation={serviceNavigation} />
}

function heroPages(locale: Locale): NamedPage[] {
  const params = <T extends object>(values: T) => ({ params: Promise.resolve({ locale, ...values }) })
  const category = getAllCategories(locale)[0]
  const post = getAllBlogPosts(locale)[0]
  const blogPages: NamedPage[] = []
  if (category) blogPages.push(["blog category", () => BlogCategoryPage(params({ category: category.slug }))])
  if (post) blogPages.push(["blog post", () => BlogPostPage(params({ post: post.slug }))])

  return [
    ["about", () => AboutPage(params({}))],
    ["contact", () => ContactPage(params({}))],
    ["blog index", () => BlogPage(params({}))],
    ...blogPages,
    ["areas served", () => AreasServedPage(params({}))],
    ["ward", () => WardPage(params({ ward: wards[0].slug }))],
    ["area", () => AreaPage(params({ ward: firstArea.ward.slug, area: firstArea.area.slug }))],
    ["legal", () => LegalPage(params({}))],
    ["privacy policy", () => PrivacyPolicyPage(params({}))],
    ["terms and conditions", () => TermsConditionsPage(params({}))],
    ["disclaimer", () => DisclaimerPage(params({}))],
    ["services index", () => ServicesPage(params({}))],
    ["parent service", () => ServicePage(params({ service: parentService.slug }))],
    ["leaf service", () => ServicePage(params({ service: leafService.slug }))],
  ]
}

function forEveryLocale(pagesFor: (locale: Locale) => NamedPage[]): PageCase[] {
  return locales.flatMap((locale) => pagesFor(locale).map(([name, page]): PageCase => [name, locale, page]))
}

export const heroPageCases = forEveryLocale(heroPages)

export const sitePageCases = forEveryLocale((locale) => [
  ["home", () => HomePage({ params: Promise.resolve({ locale }) })],
  ["site header", async () => siteHeader(locale)],
  ["site footer", async () => <Footer locale={locale} dict={getDictionary(locale)} />],
  ...heroPages(locale),
])
