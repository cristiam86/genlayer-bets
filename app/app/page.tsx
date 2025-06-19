"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Twitter, MessageCircle, Share2, Download, ExternalLink } from "lucide-react"

export default function Home() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    xHandle: "",
    discordHandle: "",
    votes: {} as Record<number, string>,
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

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

  const handleVote = (marketId: number, outcome: string) => {
    setFormData((prev) => ({
      ...prev,
      votes: { ...prev.votes, [marketId]: outcome },
    }))
  }

  const handleSubmit = async () => {
    // Simulate transaction submission
    setIsSubmitted(true)
  }

  const canProceedToVoting = formData.xHandle && formData.discordHandle
  const canSubmit = canProceedToVoting && Object.keys(formData.votes).length === 3
  const allVotesComplete = Object.keys(formData.votes).length === 3

  if (isSubmitted) {
    return (
      <div className="flex flex-col min-h-screen">
        <section className="flex-1 flex items-center justify-center py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold tracking-tight mb-4">Participation Submitted!</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Your votes have been recorded on GenLayer. Share the image below on X to be eligible for the $25
                  raffle and the "Early Testnet User" Discord role!
                </p>
              </div>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Share Your Participation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-8 mb-4">
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">🎯 I just participated in</h3>
                      <h2 className="text-2xl font-bold text-purple-600 mb-2">GenLayer's Testnet Asimov</h2>
                      <p className="text-sm text-muted-foreground mb-4">Prediction Market Campaign</p>
                      <div className="flex justify-center gap-4 text-sm">
                        <span>✅ X: @{formData.xHandle}</span>
                        <span>✅ Discord: {formData.discordHandle}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">Join at x.com/genlayer</p>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Download className="mr-2 h-4 w-4" />
                    Download Share Image
                  </Button>
                </CardContent>
              </Card>

              <div className="text-sm text-muted-foreground">
                <p>Markets resolve on June 30th. Winners will be announced on Discord!</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-16 md:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-200 to-cyan-200 opacity-30 blur-3xl"></div>
        </div>
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-2">
              Testnet Asimov's Prediction Market
            </h1>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl mb-6 text-purple-600">
              Powered by Intelligent Contracts
            </h2>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-4">
              This is GenLayer's testnet prediction market dApp. Fulfill the 3 steps below and share your image on X to
              be eligible for the $25 raffle and get the "Early Testnet User" role.
            </p>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              Vote in all 3 markets to qualify for our 25×$20 raffle and earn the "Early Testnet User" Discord role.
            </p>
          </div>
        </div>
      </section>

      {/* Participation Form */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Participate in 3 Easy Steps</h2>
              <div className="flex justify-center items-center gap-2 mb-8">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        stepNum === 1
                          ? "bg-purple-500 text-white"
                          : stepNum === 2 && canProceedToVoting
                            ? "bg-purple-500 text-white"
                            : stepNum === 3 && canSubmit
                              ? "bg-purple-500 text-white"
                              : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {stepNum}
                    </div>
                    {stepNum < 3 && <div className="w-8 h-0.5 bg-gray-200 mx-2"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Social Handles */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="h-5 w-5 text-blue-500" />
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  Enter Your Social Handles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full border-blue-500 text-blue-500 hover:bg-blue-50"
                      onClick={() => window.open("https://x.com/genlayer", "_blank")}
                    >
                      <Twitter className="mr-2 h-4 w-4" />
                      Follow Us on X
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    <div className="space-y-2">
                      <Label htmlFor="x-handle">X.com Handle</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          @
                        </span>
                        <Input
                          id="x-handle"
                          placeholder="your_handle"
                          className="pl-8"
                          value={formData.xHandle}
                          onChange={(e) => setFormData((prev) => ({ ...prev, xHandle: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full border-purple-500 text-purple-500 hover:bg-purple-50"
                      onClick={() => window.open("https://discord.gg/genlayer", "_blank")}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Join our Discord
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    <div className="space-y-2">
                      <Label htmlFor="discord-handle">Discord Handle</Label>
                      <Input
                        id="discord-handle"
                        placeholder="your_discord_handle"
                        value={formData.discordHandle}
                        onChange={(e) => setFormData((prev) => ({ ...prev, discordHandle: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Voting */}
            <Card className={`mb-8 ${!canProceedToVoting ? "opacity-50" : ""}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-green-500" />
                  Vote on All 3 Markets
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {!canProceedToVoting
                    ? "Enter your social handles first to unlock voting"
                    : `${Object.keys(formData.votes).length}/3 markets voted`}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                  {markets.map((market) => (
                    <div key={market.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                          {market.category}
                        </span>
                        <span className="text-xs text-muted-foreground">Resolves: {market.resolutionDate}</span>
                      </div>
                      <h3 className="font-semibold text-sm mb-2">{market.title}</h3>
                      <p className="text-xs text-muted-foreground mb-4">{market.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {market.outcomes.map((outcome) => (
                          <Button
                            key={outcome}
                            variant={formData.votes[market.id] === outcome ? "default" : "outline"}
                            size="sm"
                            disabled={!canProceedToVoting}
                            onClick={() => handleVote(market.id, outcome)}
                            className={
                              formData.votes[market.id] === outcome
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                : "border-purple-500 hover:bg-purple-50"
                            }
                          >
                            {outcome}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Submit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                  Submit Your Participation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-muted-foreground mb-6">
                    Submit your votes and share the following image on X to be eligible for the $25 raffle and the
                    "Early Testnet User" role.
                  </p>
                  <Button
                    size="lg"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                  >
                    {!canSubmit ? "Complete all steps above" : "Submit Participation"}
                  </Button>
                  {canSubmit && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ✅ Get all 3 bets right and get raffled for a $25 reward on GenLayer's Discord.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
