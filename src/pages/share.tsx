/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Sparkles, TrendingUp, Shield, Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function SharePage() {
  return (
    <>
      <SEO
        title="Bloom - Invest in Yourself First 🌸"
        description="Investment analysis designed for women. Learn from Pansy, get personalized picks, and build wealth with confidence."
        image="/bloom-share.png"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
        {/* Hero Section with Logo */}
        <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20">
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-gradient-radial from-accent/20 via-transparent to-transparent blur-3xl" />
          
          {/* Main Content */}
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            {/* Bloom Logo Image */}
            <div className="mb-8 flex justify-center">
              <img
                src="/bloom-share.png"
                alt="Bloom - She Blooms Wealth"
                className="h-auto w-full max-w-md drop-shadow-2xl"
              />
            </div>

            {/* Tagline */}
            <h1 className="mb-6 font-serif text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Invest in Yourself First 🌸
            </h1>
            
            <p className="mb-12 text-lg text-zinc-300 sm:text-xl">
              Investment analysis designed for women. Learn from Pansy, get personalized picks, and build wealth with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/onboarding">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-accent to-primary text-lg font-semibold hover:from-accent/90 hover:to-primary/90 sm:w-auto"
                >
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-accent text-accent hover:bg-accent/10 sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center font-serif text-3xl font-bold text-white sm:text-4xl">
              What Makes Bloom Different
            </h2>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <Card className="border-accent/20 bg-zinc-900/50 p-6 backdrop-blur">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-primary/20">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 font-semibold text-white">Made for Women</h3>
                <p className="text-sm text-zinc-400">
                  Investment education without the intimidation. Pansy explains everything in plain language.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="border-accent/20 bg-zinc-900/50 p-6 backdrop-blur">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-primary/20">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 font-semibold text-white">Pansy's Daily Picks</h3>
                <p className="text-sm text-zinc-400">
                  Your personal investing expert analyzes stocks, ETFs, and mutual funds just for you.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="border-accent/20 bg-zinc-900/50 p-6 backdrop-blur">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-primary/20">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 font-semibold text-white">Real-Time Data</h3>
                <p className="text-sm text-zinc-400">
                  Live market updates, interactive charts, and breaking news so you never miss a move.
                </p>
              </Card>

              {/* Feature 4 */}
              <Card className="border-accent/20 bg-zinc-900/50 p-6 backdrop-blur">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-primary/20">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 font-semibold text-white">Risk Management</h3>
                <p className="text-sm text-zinc-400">
                  Learn professional trading psychology and risk management that protects your capital.
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-800 px-4 py-8">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-sm text-zinc-500">
              © 2026 Cinder Vault Enterprises LLC. All rights reserved.
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              Bloom is for educational purposes only and does not constitute financial advice.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
              <Link href="/privacy" className="text-zinc-500 hover:text-accent">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-zinc-500 hover:text-accent">
                Terms of Service
              </Link>
              <Link href="/disclaimer" className="text-zinc-500 hover:text-accent">
                Disclaimer
              </Link>
              <Link href="/contact" className="text-zinc-500 hover:text-accent">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}