import type { GetServerSideProps } from "next";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { getStrategyBySlug } from "@/data/strategy-lab";
import { ArrowLeft, Wrench, Trash2, ChevronRight, Edit3 } from "lucide-react";

interface ToolbeltItem {
  strategy_slug: string;
  personal_notes: string | null;
  biggest_mistake: string | null;
  added_at: string;
}

interface Props {
  requiresClientAuth?: boolean;
}

export default function ToolbeltPage({ requiresClientAuth }: Props) {
  const [isVerifying, setIsVerifying] = useState(!!requiresClientAuth);
  const [isAuthorized, setIsAuthorized] = useState(!requiresClientAuth);
  const [items, setItems] = useState<ToolbeltItem[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editMistake, setEditMistake] = useState("");

  useEffect(() => {
    if (!requiresClientAuth) { loadToolbelt(); return; }

    const verify = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/subscription"; return; }
      const res = await fetch("/api/strategy-lab/toolbelt", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/subscription"; return;
      }
      setIsAuthorized(true);
      setIsVerifying(false);
      loadToolbelt();
    };
    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresClientAuth]);

  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }, []);

  const loadToolbelt = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch("/api/strategy-lab/toolbelt", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.toolbelt ?? []);
      }
    } catch {}
  }, [getToken]);

  const removeItem = useCallback(async (slug: string) => {
    const token = await getToken();
    if (!token) return;
    try {
      await fetch("/api/strategy-lab/toolbelt", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ strategySlug: slug, action: "remove" }),
      });
      setItems((prev) => prev.filter((i) => i.strategy_slug !== slug));
    } catch {}
  }, [getToken]);

  const saveNotes = useCallback(async (slug: string) => {
    const token = await getToken();
    if (!token) return;
    try {
      await fetch("/api/strategy-lab/toolbelt", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          strategySlug: slug,
          action: "update",
          personalNotes: editNotes,
          biggestMistake: editMistake,
        }),
      });
      setItems((prev) =>
        prev.map((i) =>
          i.strategy_slug === slug
            ? { ...i, personal_notes: editNotes, biggest_mistake: editMistake }
            : i
        )
      );
      setEditingSlug(null);
    } catch {}
  }, [getToken, editNotes, editMistake]);

  if (isVerifying) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#0E1B30]">
          <div className="w-12 h-12 border-4 border-[#27B7C8] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!isAuthorized) return null;

  return (
    <Layout>
      <SEO title="My Strategy Toolbelt — Bloom Strategy Lab" description="Your saved strategies with personal notes and lessons learned." />

      <div className="bg-[#0E1B30] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link href="/university/strategy-lab" className="inline-flex items-center gap-1.5 text-xs text-[#27B7C8] hover:text-[#27B7C8]/80 mb-6">
            <ArrowLeft className="w-3 h-3" />
            Strategy Lab
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <Wrench className="w-6 h-6 text-[#27B7C8]" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#F4F7FA]">My Strategy Toolbelt</h1>
              <p className="text-xs text-[#F4F7FA]/40">{items.length} strategies saved</p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <Wrench className="w-12 h-12 text-[#F4F7FA]/10 mx-auto mb-4" />
              <p className="text-[#F4F7FA]/40 text-sm mb-2">Your toolbelt is empty.</p>
              <p className="text-[#F4F7FA]/25 text-xs mb-6">Add strategies as you study them to build your personal reference.</p>
              <Link href="/university/strategy-lab" className="text-[#27B7C8] text-sm hover:underline">
                Browse Strategies
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const strategy = getStrategyBySlug(item.strategy_slug);
                if (!strategy) return null;

                const isEditing = editingSlug === item.strategy_slug;

                return (
                  <div key={item.strategy_slug} className="bg-[#162540] rounded-xl border border-white/5 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/university/strategy-lab/${strategy.slug}`} className="flex items-center gap-2 group">
                        <span className="text-xl">{strategy.icon}</span>
                        <div>
                          <h3 className="text-sm font-semibold text-[#F4F7FA] group-hover:text-[#27B7C8] transition-colors">
                            {strategy.name}
                          </h3>
                          <p className="text-[10px] text-[#F4F7FA]/30">{strategy.category} · {strategy.difficulty}</p>
                        </div>
                        <ChevronRight className="w-3 h-3 text-[#F4F7FA]/20" />
                      </Link>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingSlug(null);
                            } else {
                              setEditingSlug(item.strategy_slug);
                              setEditNotes(item.personal_notes ?? "");
                              setEditMistake(item.biggest_mistake ?? "");
                            }
                          }}
                          className="p-1.5 text-[#F4F7FA]/30 hover:text-[#27B7C8] transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeItem(item.strategy_slug)}
                          className="p-1.5 text-[#F4F7FA]/30 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Toolbelt summary */}
                    <div className="text-[10px] text-[#F4F7FA]/40 space-y-0.5 mb-2">
                      <p><span className="text-[#49B06E]">Look for:</span> {strategy.toolbelt.lookFor}</p>
                      <p><span className="text-red-400">Avoid:</span> {strategy.toolbelt.avoid}</p>
                    </div>

                    {/* Personal notes display */}
                    {!isEditing && item.personal_notes && (
                      <p className="text-xs text-[#F4F7FA]/50 italic mt-2 border-t border-white/5 pt-2">
                        {item.personal_notes}
                      </p>
                    )}
                    {!isEditing && item.biggest_mistake && (
                      <p className="text-[10px] text-amber-400/50 mt-1">
                        Mistake to avoid: {item.biggest_mistake}
                      </p>
                    )}

                    {/* Edit form */}
                    {isEditing && (
                      <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
                        <div>
                          <label className="text-[10px] text-[#F4F7FA]/40 block mb-1">Personal Notes</label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="What did you learn? How will you use this?"
                            className="w-full bg-[#0E1B30] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F4F7FA]/70 placeholder:text-[#F4F7FA]/20 resize-none"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#F4F7FA]/40 block mb-1">Biggest Mistake to Avoid</label>
                          <input
                            value={editMistake}
                            onChange={(e) => setEditMistake(e.target.value)}
                            placeholder="What's the #1 trap to watch out for?"
                            className="w-full bg-[#0E1B30] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F4F7FA]/70 placeholder:text-[#F4F7FA]/20"
                          />
                        </div>
                        <button
                          onClick={() => saveNotes(item.strategy_slug)}
                          className="px-4 py-1.5 bg-[#27B7C8] text-white rounded-lg text-xs font-medium hover:bg-[#27B7C8]/90 transition-colors"
                        >
                          Save Notes
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const result = await requireProUserSSR(req);
  if (result.status === "not-pro" || result.status === "unauthenticated") {
    return { redirect: { destination: "/subscription", permanent: false } };
  }
  if (result.status === "no-cookie") {
    return { props: { requiresClientAuth: true } };
  }
  return { props: {} };
};
