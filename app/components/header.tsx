"use client"

import Link from "next/link"
import Image from "next/image"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/genlayer-logo.png" alt="GenLayer" width={120} height={32} className="h-8 w-auto" />
          </Link>
        </div>

        <div className="text-sm text-muted-foreground">Testnet Asimov Campaign</div>
      </div>
    </header>
  )
}
