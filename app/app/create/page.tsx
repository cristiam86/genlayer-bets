"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { AlertCircle } from "lucide-react"

export default function CreateMarketPage() {
  const [step, setStep] = useState(1)
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = () => {
    setIsConnected(true)
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  return (
    <div className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create a Prediction Market</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Create your own prediction market and let the community vote on the outcome.
          </p>
        </div>

        {!isConnected ? (
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>You need to connect your wallet to create a prediction market.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={handleConnect}
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {step === 1 && "Market Details"}
                    {step === 2 && "Outcome Options"}
                    {step === 3 && "Resolution Details"}
                    {step === 4 && "Review & Create"}
                  </CardTitle>
                  <CardDescription>
                    {step === 1 && "Provide basic information about your prediction market"}
                    {step === 2 && "Define the possible outcomes for your market"}
                    {step === 3 && "Specify how and when the market will be resolved"}
                    {step === 4 && "Review your market details before creating"}
                  </CardDescription>
                </div>
                <div className="text-sm font-medium">Step {step} of 4</div>
              </div>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Market Title</Label>
                    <Input id="title" placeholder="E.g., Will Bitcoin reach $100,000 before 2026?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide a clear description of what this market predicts..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crypto">Crypto</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="politics">Politics</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 mb-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p>
                        Currently, only binary markets (YES/NO) are supported. More outcome types will be available
                        soon.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Outcome Type</Label>
                    <Select defaultValue="binary" disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="binary">Binary (YES/NO)</SelectItem>
                        <SelectItem value="multiple">Multiple Choice</SelectItem>
                        <SelectItem value="numeric">Numeric Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="yes-label">YES Label</Label>
                      <Input id="yes-label" defaultValue="YES" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="no-label">NO Label</Label>
                      <Input id="no-label" defaultValue="NO" />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resolution-date">Resolution Date</Label>
                    <DatePicker />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resolution-source">Resolution Source</Label>
                    <Input id="resolution-source" placeholder="E.g., CoinGecko, official website, etc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resolution-details">Resolution Details</Label>
                    <Textarea
                      id="resolution-details"
                      placeholder="Explain exactly how this market will be resolved..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="rounded-md bg-gray-50 p-4">
                    <h3 className="font-medium mb-2">Market Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="grid grid-cols-3">
                        <span className="text-muted-foreground">Title:</span>
                        <span className="col-span-2 font-medium">Will Bitcoin reach $100,000 before 2026?</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="col-span-2">Crypto</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-muted-foreground">Outcomes:</span>
                        <span className="col-span-2">YES / NO</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-muted-foreground">Resolution Date:</span>
                        <span className="col-span-2">December 31, 2025</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p>
                        Creating a market requires wallet connection to record your prediction market on the blockchain.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              {step < 4 ? (
                <Button onClick={nextStep}>Continue</Button>
              ) : (
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Create Market
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
