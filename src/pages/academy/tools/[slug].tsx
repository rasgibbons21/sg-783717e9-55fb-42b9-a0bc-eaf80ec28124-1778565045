import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight, CheckCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { AcademyLayout } from "@/components/academy/AcademyLayout";
import { Button } from "@/components/ui/button";
import { getToolBySlug } from "@/data/academy/tools";
import { canAccessTool } from "@/lib/academy/access";
import { useSubscription } from "@/contexts/SubscriptionContext";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

export default function ToolPage() {
  const router = useRouter();
  const slug = router.query.slug as string;
  const { isLoggedIn, isPro, isLoading } = useSubscription();

  const tool = slug ? getToolBySlug(slug) : undefined;

  useEffect(() => {
    if (!isLoading && !isLoggedIn && slug) {
      router.replace(`/onboarding?redirect=/academy/tools/${slug}`);
    }
  }, [isLoading, isLoggedIn, slug, router]);

  if (!slug || isLoading) return null;

  if (!tool) {
    return (
      <AcademyLayout showBack>
        <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-xl font-serif font-bold text-foreground mb-2">Tool Not Found</h2>
          <p className="text-sm text-muted-foreground mb-4">This tool doesn&apos;t exist or has been removed.</p>
          <Link href="/academy/tools">
            <Button variant="outline" className="rounded-full">Browse All Tools</Button>
          </Link>
        </div>
      </AcademyLayout>
    );
  }

  const hasAccess = canAccessTool(slug, isPro);

  if (!hasAccess) {
    return (
      <AcademyLayout showBack>
        <SEO
          title={`${tool.name} — Bloom Academy`}
          description={tool.description}
        />
        <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(39,183,200,0.12)" }}
          >
            <tool.icon className="w-8 h-8 text-[#27B7C8]" />
          </motion.div>
          <h2 className="text-xl font-serif font-bold text-foreground mb-2">{tool.name}</h2>
          <p className="text-sm text-muted-foreground mb-6">{tool.description}</p>

          <div className="w-full bg-card border border-border rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-[#27B7C8]" />
              <span className="text-sm font-semibold text-foreground">Pro Feature</span>
            </div>
            <ul className="space-y-2">
              {tool.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <Link href="/subscription" className="w-full">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => haptic()}
              className="w-full bg-gradient-to-r from-primary to-[#27B7C8] text-white py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Upgrade to Pro — $4.99/mo
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </AcademyLayout>
    );
  }

  return (
    <AcademyLayout showBack>
      <SEO
        title={`${tool.name} — Bloom Academy`}
        description={tool.description}
      />
      <div className="p-4 md:p-6">
        {/* Tool Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(39,183,200,0.12)" }}
            >
              <tool.icon className="w-6 h-6 text-[#27B7C8]" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">{tool.name}</h1>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Tool Content — placeholder UI for each tool */}
        <ToolContent slug={slug} />
      </div>
    </AcademyLayout>
  );
}

function ToolContent({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card border border-border rounded-2xl p-6 text-center"
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "rgba(39,183,200,0.08)" }}
      >
        <tool.icon className="w-10 h-10 text-[#27B7C8]/50" />
      </div>
      <h3 className="text-lg font-serif font-bold text-foreground mb-2">{tool.name}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        {tool.description}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto mb-6">
        {tool.features.map((f) => (
          <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground text-left">
            <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
            {f}
          </div>
        ))}
      </div>
      <div className="inline-flex items-center gap-2 bg-[#27B7C8]/10 border border-[#27B7C8]/20 rounded-full px-4 py-2">
        <span className="text-xs font-medium text-[#27B7C8]">
          Full interactive tool coming soon
        </span>
      </div>
    </motion.div>
  );
}
