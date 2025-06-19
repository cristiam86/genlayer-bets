export default function PartnersSection() {
  const partners = [
    { name: "Partner 1", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Partner 2", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Partner 3", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Partner 4", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Partner 5", logo: "/placeholder.svg?height=40&width=120" },
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Trusted By Leading Organizations</h2>
          <p className="text-lg text-muted-foreground">
            We've partnered with the best in blockchain and AI to build a robust prediction market platform.
          </p>
        </div>
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-4 grayscale transition-all hover:grayscale-0"
              >
                <img src={partner.logo || "/placeholder.svg"} alt={partner.name} className="h-10 object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
