import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Search, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { SEO } from "@/components/SEO";
import { AcademyLayout } from "@/components/academy/AcademyLayout";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Link from "next/link";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

const TIME_OPTIONS = ["5-10", "10-15", "15-20", "20+"];
const BUDGET_OPTIONS = ["Under $50", "Under $100", "$100-$500", "$500+"];
const EXP_OPTIONS = ["Complete beginner", "Some experience", "Experienced"];

export default function NicheFinder() {
  const router = useRouter();
  const { isLoggedIn, isPro, isLoading } = useSubscription();
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("10-15");
  const [budget, setBudget] = useState("Under $100");
  const [experience, setExperience] = useState("Complete beginner");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/onboarding?redirect=/academy/hustle/niche-finder");
    }
  }, [isLoading, isLoggedIn, router]);

  const handleSubmit = async () => {
    if (!skills.trim() || !interests.trim()) return;
    haptic();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const token = typeof window !== "undefined"
        ? localStorage.getItem("supabase_access_token")
        : null;
      const res = await fetch("/api/academy/niche-finder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ skills, interests, hoursPerWeek, budget, experience }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data.analysis);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !isLoggedIn) return null;

  if (!isPro) {
    return (
      <AcademyLayout showBack>
        <SEO title="AI Niche Finder — Bloom Academy" />
        <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#27B7C8]/15 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-[#27B7C8]" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground mb-2">AI Niche Finder</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            This AI-powered tool analyzes your skills and interests to find your perfect side hustle niche.
            Upgrade to Pro to unlock it.
          </p>
          <Link href="/subscription">
            <Button className="bg-gradient-to-r from-primary to-[#27B7C8] text-white rounded-full px-6">
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </AcademyLayout>
    );
  }

  return (
    <AcademyLayout showBack>
      <SEO
        title="AI Niche Finder — Bloom Academy"
        description="Discover your perfect side hustle niche with AI-powered analysis of your skills, interests, and market demand."
      />

      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#27B7C8]/15 flex items-center justify-center mx-auto mb-3">
            <Search className="w-7 h-7 text-[#27B7C8]" />
          </div>
          <h1 className="text-xl font-serif font-bold text-foreground mb-1">AI Niche Finder</h1>
          <p className="text-sm text-muted-foreground">
            Tell us about yourself and our AI will find the perfect side hustle niches for you.
          </p>
        </motion.div>

        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-5 space-y-5"
          >
            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Your Skills
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., Writing, graphic design, social media, spreadsheets, teaching..."
                rows={2}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-[#27B7C8]/30 focus:border-[#27B7C8]/50"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Your Interests & Passions
              </label>
              <textarea
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., Health & wellness, personal finance, fashion, cooking, travel..."
                rows={2}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-[#27B7C8]/30 focus:border-[#27B7C8]/50"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Hours Per Week
              </label>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { haptic(); setHoursPerWeek(opt); }}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                      hoursPerWeek === opt
                        ? "bg-[#27B7C8]/15 border-[#27B7C8]/30 text-[#27B7C8]"
                        : "bg-background border-border text-muted-foreground hover:border-border/60"
                    }`}
                  >
                    {opt} hrs
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Starting Budget
              </label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { haptic(); setBudget(opt); }}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                      budget === opt
                        ? "bg-[#27B7C8]/15 border-[#27B7C8]/30 text-[#27B7C8]"
                        : "bg-background border-border text-muted-foreground hover:border-border/60"
                    }`}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Side Hustle Experience
              </label>
              <div className="flex flex-wrap gap-2">
                {EXP_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { haptic(); setExperience(opt); }}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                      experience === opt
                        ? "bg-[#27B7C8]/15 border-[#27B7C8]/30 text-[#27B7C8]"
                        : "bg-background border-border text-muted-foreground hover:border-border/60"
                    }`}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading || !skills.trim() || !interests.trim()}
              className="w-full bg-gradient-to-r from-primary to-[#27B7C8] text-white rounded-full py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing your profile...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Find My Niche
                </span>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#27B7C8]" />
                <h2 className="text-base font-serif font-bold text-foreground">Your Niche Analysis</h2>
              </div>
              <div
                className="prose prose-invert prose-sm max-w-none
                  prose-headings:text-foreground prose-headings:font-serif
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-strong:text-foreground prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(result) }}
              />
            </div>

            <Button
              onClick={() => { setResult(""); setError(""); }}
              variant="outline"
              className="w-full rounded-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Different Skills
            </Button>
          </motion.div>
        )}
      </div>
    </AcademyLayout>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n- /g, '</p><ul><li>')
    .replace(/<\/li>\n/g, '</li>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
