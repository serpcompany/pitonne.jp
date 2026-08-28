import Script from "next/script"
import { X } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

const CONTACT_FORM_URL = "https://api.leadconnectorhq.com/widget/form/QJR9bZP4y72C8jUcGC7F"

export function ContactFormDialog({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-md border border-[#7A8F87] px-8 py-3 text-sm font-medium text-[#7A8F87] transition-colors hover:bg-[#7A8F87] hover:text-white sm:w-auto"
        >
          {dict.common.sendMessage}
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-auto p-2" showCloseButton={false}>
        <DialogTitle className="sr-only">{dict.contact.formTitle}</DialogTitle>
        <DialogClose asChild>
          <button
            type="button"
            aria-label={dict.contact.closeForm}
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground shadow-md transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </DialogClose>
        <iframe
          src={CONTACT_FORM_URL}
          className="min-h-[497px] w-full border-0"
          id="inline-QJR9bZP4y72C8jUcGC7F"
          data-form-name="Contact"
          data-height="497"
          data-form-id="QJR9bZP4y72C8jUcGC7F"
          title={dict.contact.formTitle}
        />
        <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
      </DialogContent>
    </Dialog>
  )
}
