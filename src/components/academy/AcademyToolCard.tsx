import Link from "next/link";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { AcademyTool } from "@/data/academy/tools";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

interface Props {
  tool: AcademyTool;
  isPro: boolean;
  index?: number;
}

export function AcademyToolCard({ tool, isPro, index = 0 }: Props) {
  const locked = tool.isPremium && !isPro;

  return (
    <Link href={`/academy/tools/${tool.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 * index, type: "spring", stiffness: 300, damping: 24 }}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(39,183,200,0.15)" }}
        onClick={() => haptic()}
        className="relative bg-card border border-border rounded-2xl p-5 h-full cursor-pointer transition-colors hover:border-[#27B7C8]/30"
      >
        {locked && (
          <div className="absolute top-3 right-3">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
        )}

        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(39,183,200,0.12)" }}
          >
            <tool.icon className="w-5 h-5 text-[#27B7C8]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-bold text-foreground truncate">{tool.name}</h3>
              {tool.tag && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                  {tool.tag}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        {locked && (
          <div className="mt-2 text-[10px] font-semibold text-[#27B7C8] uppercase tracking-wider">
            Pro Feature
          </div>
        )}
      </motion.div>
    </Link>
  );
}
