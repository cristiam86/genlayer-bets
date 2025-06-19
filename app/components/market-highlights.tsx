import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function MarketHighlights() {
  const markets = [
    {
      id: 1,
      title: "Fifa World Cup June 15: PSG to win all group stage games?",
      description: "Will Paris Saint-Germain win all of their group stage matches in the upcoming FIFA World Cup?",
      outcomes: ["YES", "NO"],
      resolutionDate: "June 15, 2025",
      category: "Sports",
    },
    {
      id: 2,
      title: "New AI model to surpass OpenAI's o3-pro",
      description:
        "Will ANY creator/company release a new AI model with more Artificial Intelligence (currently 71) than OpenAI's o3-pro model?",
      outcomes: ["YES", "NO"],
      resolutionDate: "June 30, 2025",
      category: "Technology",
    },
    {
      id: 3,
      title: "GenLayer AMA to surpass 340 members",
      description: "Will one GenLayer AMA surpass more than 340 members according to the official website?",
      outcomes: ["YES", "NO"],
      resolutionDate: "July 1, 2025",
      category: "Crypto",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Featured Prediction Markets</h2>
          <p className="text-lg text-muted-foreground">
            Explore our most popular prediction markets and place your bets on the outcomes.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {markets.map((market) => (
            <Card key={market.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                    {market.category}
                  </span>
                  <span className="text-sm text-muted-foreground">Resolves: {market.resolutionDate}</span>
                </div>
                <CardTitle className="text-xl mt-2">{market.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{market.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {market.outcomes.map((outcome, index) => (
                    <Button key={index} variant="outline" className="border-2 border-purple-500 hover:bg-purple-50">
                      {outcome}
                    </Button>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href={`/markets/${market.id}`}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-50" asChild>
            <Link href="/markets">
              View All Markets <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
