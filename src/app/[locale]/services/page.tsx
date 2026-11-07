import { ServicesIndexTemplate } from '@/components/services/services-index-template'
import { getServiceCategorySections } from '@/lib/data/services'
import {
  type LocalePageProps,
  localeDictionary,
  localeStaticParams,
  localizedMetadata
} from '../locale-page'

export const dynamicParams = false

export const generateStaticParams = localeStaticParams

export const generateMetadata = localizedMetadata('/services/', ({ services }) => ({
  title: services.metaTitle,
  description: services.metaDescription
}))

export default async function ServicesPage({ params }: LocalePageProps) {
  const { locale } = localeDictionary(await params)

  return <ServicesIndexTemplate sections={getServiceCategorySections(locale)} locale={locale} />
}
