"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Twitter, MessageCircle, Share2, Download, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import GenLayerBets from "@/logic/GenLayerBets"
import { account, createAccount } from "@/services/genlayer"

// Contract address - you'll need to replace this with your deployed contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890" // Replace with actual address
const genlayerBets = new GenLayerBets(CONTRACT_ADDRESS)

export default function Home() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    xHandle: "",
    discordHandle: "",
    votes: {} as Record<number, string>,
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
        
        // Update contract with user account
        genlayerBets.updateAccount(currentAccount)
        
        // Fetch bets from contract
        const contractBets = await genlayerBets.getBets()
        const userBetsData = await genlayerBets.getAllUserBets(currentAccount?.address)
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
            const existingVotes: Record<number, string> = {}
            userBetsData.user_bet_selections.forEach((betSelection: any, index: number) => {
              existingVotes[index] = betSelection.selected_outcome
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

  const handleVote = (marketId: number, outcome: string) => {
    setFormData((prev) => ({
      ...prev,
      votes: { ...prev.votes, [marketId]: outcome },
    }))
  }

  const handleSubmit = async () => {
    if (!genlayerBets || !userAccount) {
      setError("Please wait for wallet initialization")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Convert votes to the format expected by the contract
      const bet0Outcome = formData.votes[0]?.toLowerCase() || "no"
      const bet1Outcome = formData.votes[1]?.toLowerCase() || "no"
      const bet2Outcome = formData.votes[2]?.toLowerCase() || "no"

      // Submit bets to contract
      const receipt = await genlayerBets.placeBets(
        formData.discordHandle,
        formData.xHandle,
        bet0Outcome,
        bet1Outcome,
        bet2Outcome
      )

      console.log("Transaction receipt:", receipt)
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
            This is GenLayer's testnet prediction market quest. Fulfill the 3 steps below and share your image on X to be eligible for the $25 raffle and get the "Early Testnet User" role.
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
                  <p className="text-sm text-green-600 font-medium">✅ You have already participated in this prediction market!</p>
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
                  {hasAlreadyParticipated ? "Your Votes" : "Vote on All 3 Markets"}
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
                      const selectedOutcome = userBetSelection?.selected_outcome || formData.votes[index]
                      
                      return (
                        <div key={bet.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                              {bet.category}
                            </span>
                            <span className="text-xs text-muted-foreground">Resolves: {bet.resolution_date}</span>
                          </div>
                          <h3 className="font-semibold text-sm mb-2">{bet.title}</h3>
                          <p className="text-xs text-muted-foreground mb-4">{bet.description}</p>
                          
                          {hasAlreadyParticipated && selectedOutcome && (
                            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                              <p className="text-xs text-green-700 font-medium">
                                Your vote: <span className="uppercase">{selectedOutcome}</span>
                              </p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-2">
                            {["yes", "no"].map((outcome) => (
                              <Button
                                key={outcome}
                                variant={selectedOutcome === outcome ? "default" : "outline"}
                                size="sm"
                                disabled={!canProceedToVoting || hasAlreadyParticipated}
                                onClick={() => handleVote(index, outcome)}
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
                        Submit your votes and share the following image on X to be eligible for the $25 raffle and the
                        "Early Testnet User" role.
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
                            Submitting...
                          </>
                        ) : !canSubmit ? (
                          "Complete all steps above"
                        ) : (
                          "Submit Participation"
                        )}
                      </Button>
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
