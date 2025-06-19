import { Shield, Clock, Zap, Users } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Shield className="h-10 w-10 text-purple-500" />,
      title: "Trustless Verification",
      description: "Smart contracts automatically verify outcomes and distribute rewards without intermediaries.",
    },
    {
      icon: <Clock className="h-10 w-10 text-pink-500" />,
      title: "Real-Time Resolution",
      description: "Markets resolve in real-time as events unfold, with immediate settlement of predictions.",
    },
    {
      icon: <Zap className="h-10 w-10 text-blue-500" />,
      title: "Lightning Fast Transactions",
      description: "Built on Layer 2 solutions for minimal fees and near-instant transaction confirmations.",
    },
    {
      icon: <Users className="h-10 w-10 text-green-500" />,
      title: "Community Governance",
      description: "Token holders vote on platform upgrades, fee structures, and dispute resolution mechanisms.",
    },
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            A Protocol That Uses AI to Resolve Disputes and Enforce Digital Contracts
          </h2>
          <p className="mb-12 text-lg text-muted-foreground">
            Our decentralized oracle network combines on-chain data with AI-powered verification to ensure accurate and
            tamper-proof market resolutions.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border"
            >
              <div className="mb-4 rounded-full bg-gray-100 p-3">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
