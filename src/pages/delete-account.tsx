import { useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function DeleteAccount() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    const { error: insertErr } = await supabase
      .from("account_deletion_requests" as any)
      .insert({ email: email.trim(), message: message.trim() || null });

    if (insertErr) {
      setError("Something went wrong. Please try again or email us directly.");
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <Layout>
      <SEO
        title="Delete Account | She Blooms Wealth"
        description="Request deletion of your She Blooms Wealth account and associated data."
      />
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
        <div>
          <h1 className="mb-2 font-serif text-4xl font-bold text-primary">Delete Account</h1>
          <p className="text-muted-foreground">
            Request deletion of your She Blooms Wealth account
          </p>
        </div>

        {submitted ? (
          <Card className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h2 className="font-serif text-2xl font-semibold text-primary">
                Request Received
              </h2>
              <p className="text-foreground">
                Your account deletion request has been received. We will process it within 30 days.
              </p>
              <p className="text-sm text-muted-foreground">
                You will receive a confirmation email at <strong>{email}</strong> once your account has been deleted.
              </p>
              <Link href="/" className="mt-4 text-primary hover:underline">
                Return to Home
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <Card className="p-6">
              <div className="prose prose-sm max-w-none">
                <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">
                  What happens when you delete your account
                </h2>
                <p className="mb-4 text-foreground">
                  When you request account deletion, the following data associated with your She Blooms Wealth account will be permanently removed:
                </p>
                <ul className="mb-6 space-y-2 text-foreground">
                  <li>Profile information (name, email, avatar)</li>
                  <li>Lesson and course progress</li>
                  <li>Saved settings and preferences</li>
                  <li>Notification preferences</li>
                  <li>Watchlists, journals, and app activity</li>
                </ul>

                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                  <div className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        Retention notice
                      </p>
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                        Payment and subscription records handled by Stripe may be retained as required for legal, tax, fraud prevention, and accounting purposes.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Deletion requests are processed within <strong>30 days</strong>. If you change your mind, contact us at{" "}
                  <a href="mailto:admin@vanguardapexholdings.com" className="text-primary hover:underline">
                    admin@vanguardapexholdings.com
                  </a>{" "}
                  before processing is complete.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">
                Request Account Deletion
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the email address associated with your account.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (optional)</Label>
                  <textarea
                    id="message"
                    rows={3}
                    placeholder="Let us know if there's anything else we should know..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit Deletion Request"}
                </Button>
              </form>
            </Card>

            <Card className="border-accent bg-accent/5 p-4">
              <p className="text-sm text-muted-foreground">
                This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.
              </p>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
