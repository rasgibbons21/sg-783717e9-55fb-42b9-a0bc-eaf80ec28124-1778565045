import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
        <meta name="description" content="Page not found" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-[#0E1B30] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#F4F7FA]">404</h1>
          <p className="text-lg text-[#F4F7FA]/60">Sorry, we couldn't find the page you requested. This page may have been moved, deleted, or never existed.</p>
          <Button asChild className="bg-[#27B7C8] text-[#0E1B30] hover:bg-[#27B7C8]/90 font-semibold">
            <Link href="/">
              Return to home page
            </Link>
          </Button>
        </div>
      </main>
    </>
  )
}
