import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Share2, Info } from "lucide-react"
import Link from "next/link"

interface MarketPageProps {
  params: {
    id: string
  }
}

export default function MarketPage({ params }: MarketPageProps) {
  // This would normally come from an API or database
  const markets = [
    {
      id: "1",
      title: "Fifa World Cup June 15: PSG to win all group stage games?",
      description: "Will Paris Saint-Germain win all of their group stage matches in the upcoming FIFA World Cup?",
      longDescription:
        "This market resolves to YES if Paris Saint-Germain wins all of their group stage matches in the FIFA World Cup starting June 15, 2025. It resolves to NO if they lose or draw any match. The market will be resolved based on official FIFA results.",
      outcomes: ["YES", "NO"],
      resolutionDate: "June 15, 2025",
      category: "Sports",
    },
    {
      id: "2",
      title: "New AI model to surpass OpenAI's o3-pro",
      description:
        "Will ANY creator/company release a new AI model with more Artificial Intelligence (currently 71) than OpenAI's o3-pro model?",
      longDescription:
        "This market resolves to YES if any creator or company releases an AI model that scores higher than 71 on the Artificial Analysis leaderboard (https://artificialanalysis.ai/leaderboards/models) before June 30, 2025. The market will be resolved based on the official leaderboard data.",
      outcomes: ["YES", "NO"],
      resolutionDate: "June 30, 2025",
      category: "Technology",
    },
    {
      id: "3",
      title: "GenLayer AMA to surpass 340 members",
      description: "Will one GenLayer AMA surpass more than 340 members according to the official website?",
      longDescription:
        "This market resolves to YES if any GenLayer AMA session has more than 340 members participating according to the official website tracking before July 1, 2025. The market will be resolved based on the official member count displayed on the website.",
      outcomes: ["YES", "NO"],
      resolutionDate: "July 1, 2025",
      category: "Crypto",
    },
  ]

  const market = markets.find((m) => m.id === params.id)

  if (!market) {
    return (
      <div className="container px-4 py-12 md:px-6 md:py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Market Not Found</h1>
        <p className="mb-8">The market you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/markets">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Markets
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mb-6">
        <Link
          href="/markets"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Markets
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                {market.category}
              </span>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{market.title}</h1>
            <p className="mt-2 text-muted-foreground">{market.description}</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Market Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Resolution Details</h3>
                  <p className="text-sm text-muted-foreground">{market.longDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolution Date</p>
                    <p className="font-medium">{market.resolutionDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{market.category}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Connect your wallet to join the discussion</p>
                <Button className="mt-4">Connect Wallet</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Cast Your Vote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Choose an Outcome</span>
                    <span className="text-xs text-muted-foreground">Resolves: {market.resolutionDate}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {market.outcomes.map((outcome, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="border-2 border-purple-500 hover:bg-purple-50 h-16 text-lg"
                      >
                        {outcome}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                >
                  Connect Wallet to Vote
                </Button>

                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                  <div className="flex">
                    <Info className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>Voting requires connecting a wallet. All votes are recorded on-chain with smart contracts.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
