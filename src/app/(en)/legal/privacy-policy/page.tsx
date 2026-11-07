import * as localePage from '@/app/[locale]/legal/privacy-policy/page'
import { englishStaticRoute } from '../../route-helpers'

const route = englishStaticRoute(localePage)

export const generateMetadata = route.generateMetadata

export default route.Page
