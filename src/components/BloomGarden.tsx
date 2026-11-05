import { motion } from "framer-motion";
import { Botanical } from "@/components/brand/Botanical";

/** One soft bloom per finished lesson, with quiet buds for those still to come. */
export function BloomGarden({ completedCount, total }: { completedCount: number; total: number }) {
  return (
    <div className="flex flex-wrap gap-1" role="img" aria-label={`${completedCount} of ${total} lessons finished`}>
      {Array.from({ length: total }, (_, index) =>
        index < completedCount ? (
          <motion.span
            key={index}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: Math.min(index * 0.03, 0.5), type: "spring", stiffness: 180, damping: 14 }}
          >
            <Botanical variant="bloom" className="h-7 w-6" />
          </motion.span>
        ) : (
          <span key={index} className="flex h-7 w-6 items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-[var(--bloom-sage)] opacity-20" />
          </span>
        ),
      )}
    </div>
  );
}
