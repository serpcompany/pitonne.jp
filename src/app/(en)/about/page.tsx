import * as localePage from '@/app/[locale]/about/page'
import { englishStaticRoute } from '../route-helpers'

const route = englishStaticRoute(localePage)

export const generateMetadata = route.generateMetadata

export default route.Page
