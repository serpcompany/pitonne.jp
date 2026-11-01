import * as localePage from '@/app/[locale]/legal/terms-conditions/page'
import { englishStaticRoute } from '../../route-helpers'

const route = englishStaticRoute(localePage)

export const generateMetadata = route.generateMetadata

export default route.Page
