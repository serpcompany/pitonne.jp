import { ContactButton } from "@/components/shared/contact-button"

export function HowToGetStartedSection({ locationLabel }: { locationLabel?: string }) {
  return (
    <section className="bg-card py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center font-serif text-3xl text-foreground">How To Get Started</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {["Send Request", "Clinical Review", "Care Planning"].map((step, index) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#7A8F87] text-lg font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mb-2 font-medium text-foreground">{step}</h3>
                <p className="text-sm text-muted-foreground">
                  {index === 0 && `Share your ${locationLabel ? `${locationLabel} ` : ""}location, timing, and the service you want to discuss.`}
                  {index === 1 && "The team reviews your goals, health history, and clinical suitability."}
                  {index === 2 && "Pitonne confirms the appropriate next step for clinic or visit-based care."}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <ContactButton>Contact Pitonne</ContactButton>
          </div>
        </div>
      </div>
    </section>
  )
}
