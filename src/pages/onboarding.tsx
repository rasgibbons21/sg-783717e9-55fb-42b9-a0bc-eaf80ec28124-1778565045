import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, MailCheck } from "lucide-react";
import { SEO } from "@/components/SEO";
import { BloomMark } from "@/components/brand/BloomMark";
import { RiskNote } from "@/components/RiskNote";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { trackLogin, trackSignup } from "@/lib/analytics";
import { postAuthPath } from "@/lib/postAuthPath";

type Mode = "signup" | "login";

const inputClass =
  "h-12 w-full rounded-2xl border border-border bg-card px-4 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

/** Marks the member as onboarded and returns where they should go next. */
async function finishAndGetPath(userId: string, returnTo: string | null): Promise<string> {
  const { data: profile } = await supabase.from("profiles").select("onboarding_complete").eq("id", userId).single();
  const path = postAuthPath(profile, returnTo);
  if (!profile?.onboarding_complete) {
    await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", userId);
  }
  return path;
}

export default function SignUpPage() {
  const router = useRouter();
  const returnTo = typeof router.query.returnTo === "string" ? router.query.returnTo : null;

  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const submitLock = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.mode === "login") setMode("login");
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) router.replace(await finishAndGetPath(session.user.id, returnTo));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitLock.current) return;
    setError(null);

    if (mode === "signup" && !name.trim()) return setError("Please tell us your name.");
    if (mode === "signup" && password.length < 8) return setError("Please choose a password with at least 8 characters.");
    if (mode === "signup" && !accepted) return setError("Please accept the Terms and Privacy Policy to continue.");

    submitLock.current = true;
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { user, error: signUpError } = await authService.signUp(email.trim(), password, name.trim());
        if (signUpError || !user) {
          setError(signUpError?.message ?? "Something went wrong. Please try again.");
          return;
        }
        trackSignup("email");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setCheckEmail(true);
          return;
        }
        window.location.href = await finishAndGetPath(user.id, returnTo);
        return;
      }

      const { user, error: loginError } = await authService.signIn(email.trim(), password);
      if (loginError || !user) {
        setError(loginError?.message ?? "We couldn't sign you in. Please try again.");
        return;
      }
      trackLogin("email");
      window.location.href = await finishAndGetPath(user.id, returnTo);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Start free - Bloom" description="Join Bloom free and start your first interactive stock lesson. No card, nothing to pay." />
      <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8">

        <main className="relative mx-auto flex max-w-md flex-col">
          <Link href="/" className="mb-8 flex items-center gap-2 self-start">
            <BloomMark size={36} />
            <span className="font-serif text-2xl font-semibold text-foreground">Bloom</span>
          </Link>

          {checkEmail ? (
            <section className="rounded-3xl bg-card p-6 text-center shadow-[var(--bloom-shadow)]">
              <MailCheck className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h1 className="text-3xl font-semibold text-foreground">Check your email</h1>
              <p className="mt-3 text-base text-muted-foreground">
                We sent a link to <strong className="text-foreground">{email}</strong>. Tap it and your first gold lesson will be waiting.
              </p>
            </section>
          ) : (
            <section className="rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]">
              <h1 className="text-3xl font-semibold leading-tight text-foreground">
                {mode === "signup" ? "Start learning, free" : "Welcome back"}
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                {mode === "signup"
                  ? "No card and nothing to pay. Your first lesson starts right after this."
                  : "Sign in and pick up where you left off."}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                {mode === "signup" && (
                  <label className="block text-sm font-medium text-foreground">
                    Your name
                    <input
                      className={`${inputClass} mt-1`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </label>
                )}
                <label className="block text-sm font-medium text-foreground">
                  Email
                  <input
                    className={`${inputClass} mt-1`}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Password
                  <input
                    className={`${inputClass} mt-1`}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    required
                  />
                </label>

                {mode === "signup" && (
                  <label className="flex items-start gap-3 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-[var(--bloom-sage)]"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="/terms" className="underline underline-offset-2">Terms</Link> and{" "}
                      <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
                    </span>
                  </label>
                )}

                {error && (
                  <p role="alert" className="rounded-2xl bg-accent px-4 py-3 text-sm text-foreground">
                    {error}
                  </p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === "signup" ? "Start my first lesson" : "Sign in"}
                </motion.button>
              </form>

              <div className="mt-5 flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={() => {
                    setError(null);
                    setMode(mode === "signup" ? "login" : "signup");
                  }}
                >
                  {mode === "signup" ? "Already have an account? Sign in" : "New here? Start free"}
                </button>
                {mode === "login" && (
                  <Link href="/forgot-password" className="underline underline-offset-2">
                    Forgot your password?
                  </Link>
                )}
              </div>
            </section>
          )}

          <div className="mt-6">
            <RiskNote />
          </div>
        </main>
      </div>
    </>
  );
}
