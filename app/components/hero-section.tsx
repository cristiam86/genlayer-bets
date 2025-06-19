import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-200 to-cyan-200 opacity-30 blur-3xl"></div>
      </div>
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Trust Infrastructure for The Prediction Age
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                GenLayer Bets provides a decentralized platform for prediction markets, enabling transparent and
                trustless betting on real-world outcomes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                asChild
              >
                <Link href="/markets">
                  Explore Markets <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-70 blur-md"></div>
            <div className="absolute inset-1 rounded-lg bg-white"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-3/4 w-3/4">
                <div className="absolute top-0 left-0 h-16 w-16 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 transform -rotate-12"></div>
                <div className="absolute bottom-0 right-0 h-16 w-16 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 transform rotate-12"></div>
                <div className="absolute top-1/2 right-0 h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 transform -translate-y-1/2"></div>
                <div className="absolute bottom-1/4 left-1/4 h-10 w-10 rounded-md bg-gradient-to-br from-green-500 to-emerald-500"></div>
                <div className="absolute top-1/3 left-1/2 h-14 w-14 rounded-md bg-gradient-to-br from-red-500 to-rose-500 transform -translate-x-1/2 rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
