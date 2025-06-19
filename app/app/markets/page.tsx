import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowRight, Filter } from "lucide-react"

export default function MarketsPage() {
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
    {
      id: 4,
      title: "Bitcoin to reach $100,000 before August",
      description: "Will the price of Bitcoin (BTC) reach or exceed $100,000 USD before August 1st, 2025?",
      outcomes: ["YES", "NO"],
      resolutionDate: "August 1, 2025",
      category: "Crypto",
    },
    {
      id: 5,
      title: "Apple to announce AR glasses in 2025",
      description: "Will Apple officially announce AR glasses or similar wearable AR device before the end of 2025?",
      outcomes: ["YES", "NO"],
      resolutionDate: "December 31, 2025",
      category: "Technology",
    },
    {
      id: 6,
      title: "Ethereum to implement full sharding in 2025",
      description: "Will Ethereum successfully implement full sharding before the end of 2025?",
      outcomes: ["YES", "NO"],
      resolutionDate: "December 31, 2025",
      category: "Crypto",
    },
  ]

  const categories = ["All", "Sports", "Technology", "Crypto", "Politics", "Entertainment"]

  return (
    <div className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">Prediction Markets</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Browse and participate in decentralized prediction markets across various categories. Place your bets and earn
          rewards for accurate predictions.
        </p>
      </div>

      <div className="mb-8">
        <Tabs defaultValue="All" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {markets
                  .filter((market) => category === "All" || market.category === category)
                  .map((market) => (
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
                        <p className="text-muted-foreground mb-4">{market.description}</p>
                        <div className="grid grid-cols-2 gap-4">
                          {market.outcomes.map((outcome, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="border-2 border-purple-500 hover:bg-purple-50"
                            >
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
