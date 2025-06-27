"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Twitter, MessageCircle, Share2, Download, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import DatabaseBets from "@/logic/DatabaseBets"
import { account, createAccount } from "@/services/genlayer"

// Initialize database bets service
const databaseBets = new DatabaseBets()

export default function Home() {
  const [formData, setFormData] = useState({
    xHandle: "",
    discordHandle: "",
    votes: {} as Record<string, string>,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bets, setBets] = useState<any[]>([])
  const [userAccount, setUserAccount] = useState<any>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [userBets, setUserBets] = useState<any>(null)
  const [hasAlreadyParticipated, setHasAlreadyParticipated] = useState(false)

  // Initialize wallet and contract transparently
  useEffect(() => {
    const initializeWalletAndContract = async () => {
      try {
        // Check if account exists, create one if it doesn't
        let currentAccount = account
        
        if (!currentAccount) {
          currentAccount = createAccount()
        }
        
        setUserAccount(currentAccount)
        
        // Fetch bets from database
        const contractBets = await databaseBets.getBets()
        const userBetsData = await databaseBets.getAllUserBets(currentAccount?.address)
        console.log("🚀 ~ initializeWalletAndContract ~ userBets:", userBetsData)
        
        // Ensure we always set an array, even if the contract returns null/undefined
        setBets(Array.isArray(contractBets) ? contractBets : [])
        
        // Check if user has already participated
        if (userBetsData && userBetsData.total_users > 0 && userBetsData.user_addresses.includes(currentAccount?.address)) {
          setUserBets(userBetsData)
          setHasAlreadyParticipated(true)
          
          // Pre-fill form with existing data
          const userAddr = currentAccount?.address
          if (userBetsData.user_handlers) {
            setFormData(prev => ({
              ...prev,
              xHandle: userBetsData.user_handlers.x_handler || "",
              discordHandle: userBetsData.user_handlers.discord_handler || "",
            }))
          }
          
          // Pre-fill votes with existing selections
          if (userBetsData.user_bet_selections) {
            const existingVotes: Record<string, string> = {}
            userBetsData.user_bet_selections.forEach((betSelection: any) => {
              // Find the bet by betId to get the internal ID
              const bet = bets.find(b => b.betId === betSelection.bet_id)
              if (bet) {
                existingVotes[bet.id] = betSelection.selected_outcome
              }
            })
            setFormData(prev => ({
              ...prev,
              votes: existingVotes
            }))
          }
        } else {
          setUserBets(null)
          setHasAlreadyParticipated(false)
        }
      } catch (err) {
        console.error("Failed to initialize contract:", err)
        setError("Failed to connect to the prediction market contract")
        // Set empty array on error
        setBets([])
      } finally {
        setIsInitializing(false)
      }
    }

    initializeWalletAndContract()
  }, [])

  const handleVote = (marketId: string, outcome: string) => {
    setFormData((prev) => ({
      ...prev,
      votes: { ...prev.votes, [marketId]: outcome },
    }))
  }

  const handleSubmit = async () => {
    if (!databaseBets || !userAccount) {
      setError("Please wait for initialization")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create the bet ID to outcome mapping directly from user votes
      const betOutcomes: { [key: string]: string } = {};
      
      // Map each bet's outcome using the betId
      bets.forEach(bet => {
        const userOutcome = formData.votes[bet.id];
        if (userOutcome) {
          betOutcomes[bet.betId] = userOutcome.toLowerCase();
        }
      });

      // Submit bets to database with the explicit mapping
      const receipt = await databaseBets.placeBets(
        formData.discordHandle,
        formData.xHandle,
        betOutcomes,
        userAccount.address
      )

      if (receipt.consensus_data.leader_receipt[0].execution_result === "SUCCESS") {
        setHasAlreadyParticipated(true)
      }
    } catch (err: any) {
      console.error("Failed to submit bets:", err)
      setError(err.message || "Failed to submit your bets. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadShareImage = () => {
    const link = document.createElement('a')
    link.href = '/genlayer_social_share.png'
    link.download = 'genlayer_social_share.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const canProceedToVoting = formData.xHandle && formData.discordHandle && userAccount
  const canSubmit = canProceedToVoting && Object.keys(formData.votes).length === 3
  const allVotesComplete = Object.keys(formData.votes).length === 3

  if (isInitializing) {
    return (
      <div className="flex flex-col min-h-screen">
        <section className="flex-1 flex items-center justify-center py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-purple-500" />
              <h1 className="text-2xl font-bold tracking-tight mb-4">Initializing...</h1>
              <p className="text-muted-foreground">Setting up your prediction market experience</p>
            </div>
          </div>
        </section>
      </div>
    )
  }


  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0 -z-10">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url("/bg.jpg")',
              height: '100%',
              width: '100%',
            }}
          />
          <div className="absolute inset-0 bg-black/30" /> {/* Darker overlay for better contrast */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/30 opacity-30 blur-3xl"></div>
        </div>
        <div className="container relative z-10 px-4 md:px-6 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-2 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_10px_rgb(0_0_0_/_20%)]">
              Testnet Community Quest: Powered by Intelligent Contracts
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-white mb-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] [text-shadow:_1px_1px_4px_rgb(0_0_0_/_20%)] font-medium">
              Complete 3 simple steps to enter the 20 x $25 raffle and earn the exclusive "Early Testnet Community" role.
            </p>
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div className="container px-4 md:px-6 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

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
                        stepNum === 1 && canProceedToVoting
                          ? "bg-purple-500 text-white"
                          : stepNum === 2 && canSubmit
                            ? "bg-purple-500 text-white"
                            : stepNum === 3 && allVotesComplete
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
                  {hasAlreadyParticipated ? "Your Social Handles" : "Enter Your Social Handles"}
                </CardTitle>
                {hasAlreadyParticipated && (
                  <p className="text-sm text-green-600 font-medium">✅ You've successfully joined the quest!</p>
                )}
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
                          disabled={hasAlreadyParticipated}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full border-purple-500 text-purple-500 hover:bg-purple-50"
                      onClick={() => window.open("https://discord.gg/8Jm4v89VAu", "_blank")}
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
                        disabled={hasAlreadyParticipated}
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
                  {hasAlreadyParticipated ? "Your Votes" : "Vote on All 3 Bets"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {hasAlreadyParticipated
                    ? "Your votes have been recorded"
                    : !canProceedToVoting
                    ? "Enter your social handles first to unlock voting"
                    : `${Object.keys(formData.votes).length}/3 markets voted`}
                </p>
              </CardHeader>
              <CardContent>
                {bets.length === 0 ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading markets...</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                    {bets.map((bet, index) => {
                      const userBetSelection = userBets?.user_bet_selections?.find((selection: any) => selection.bet_id === bet.id)
                      const selectedOutcome = userBetSelection?.selected_outcome || formData.votes[bet.id]
                      
                      return (
                        <div key={bet.id} className="border rounded-lg p-4 h-full flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                              {bet.category}
                            </span>
                            <span className="text-xs text-muted-foreground">Resolves: {bet.resolution_date}</span>
                          </div>
                          <h3 className="font-semibold text-sm mb-2">{bet.title}</h3>
                          <p className="text-xs text-muted-foreground mb-4 flex-1">{bet.description}</p>
                          <p className="text-xs text-muted-foreground mb-0">
                            <span className="font-bold">Resolution</span>{" "}
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            {bet.resolution_url ? (
                              <a href={bet.resolution_url} target="_blank" rel="noopener noreferrer" className="hover:underline break-all text-xs">
                                {bet.resolution_url.length > 35
                                  ? `${bet.resolution_url.slice(0, 30)}...${bet.resolution_url.slice(-5)}`
                                  : bet.resolution_url} <ExternalLink className="inline h-3 w-3" />
                              </a>
                            ) : bet.resolution_x_method === "get_user_latest_tweets" ? (
                              <span className="text-xs">
                                Latest tweets from "{bet.resolution_x_parameter}"
                              </span>
                            ) : bet.resolution_x_method === "get_tweet_data" ? (
                              <a href={`https://x.com/GenLayer/status/${bet.resolution_x_parameter}`} target="_blank" rel="noopener noreferrer" className="hover:underline break-all text-xs">
                                https://x.com/GenLayer/status/{bet.resolution_x_parameter} <ExternalLink className="inline h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">No resolution method specified</span>
                            )}
                          </p>

                          
                          {hasAlreadyParticipated && selectedOutcome && (
                            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                              <p className="text-xs text-green-700 font-medium">
                                Your vote: <span className="uppercase">{selectedOutcome}</span>
                              </p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-2 mt-auto">
                            {["yes", "no"].map((outcome) => (
                              <Button
                                key={outcome}
                                variant={selectedOutcome === outcome ? "default" : "outline"}
                                size="sm"
                                disabled={!canProceedToVoting || hasAlreadyParticipated}
                                onClick={() => handleVote(bet.id, outcome)}
                                className={
                                  selectedOutcome === outcome
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                    : "border-purple-500 hover:bg-purple-50"
                                }
                              >
                                {outcome.toUpperCase()}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Submit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                  {hasAlreadyParticipated ? "Participation Status" : "Submit Your Participation"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {hasAlreadyParticipated ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">Participation Confirmed!</p>
                        <p className="text-sm text-green-600 mt-1">
                          Your votes have been recorded on the blockchain. Share your participation on X to be eligible for rewards!
                        </p>
                      </div>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        onClick={downloadShareImage}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Share Image
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-muted-foreground mb-6">
                      Submit your votes and share the following image on X to be eligible for the 20 x $25 raffle and the "Early Testnet Community" role.
                      </p>
                      <Button
                        size="lg"
                        disabled={!canSubmit || isLoading}
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing your transaction...
                          </>
                        ) : !canSubmit ? (
                          "Complete All Steps Above"
                        ) : (
                          "Submit Participation"
                        )}
                      </Button>
                      {isLoading && (
                        <p className="text-xs text-muted-foreground mt-2">
                           Your shareable image will appear in ~1 minute.
                        </p>
                      )}
                      {canSubmit && (
                        <p className="text-xs text-muted-foreground mt-2">
                          ✅ Get all 3 bets right and get raffled for a $25 reward on GenLayer's Discord.
                        </p>
                      )}
                    </>
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
