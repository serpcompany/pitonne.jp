import HomePage from "@/app/[locale]/page"
import { englishLocaleParams } from "./route-helpers"

export default function Page() {
  return <HomePage params={englishLocaleParams} />
}
