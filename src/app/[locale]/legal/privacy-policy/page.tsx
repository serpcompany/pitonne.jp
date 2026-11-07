import { legalDocumentRoute } from '../legal-document-route'

const route = legalDocumentRoute('privacyPolicy')

export const dynamicParams = false

export const generateStaticParams = route.generateStaticParams

export const generateMetadata = route.generateMetadata

export default route.Page
