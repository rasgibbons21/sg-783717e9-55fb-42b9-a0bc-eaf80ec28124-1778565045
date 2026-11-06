import { useMemo, useState } from "react";
import { Reorder, motion } from "framer-motion";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import type { LessonBlock } from "@/data/lessons-stocks/types";
import { isOrderCorrect, shuffleNotSolved } from "@/lib/lessons/engine";
import { Feedback } from "./Feedback";

type OrderData = Extract<LessonBlock, { type: "order" }>;

export function OrderBlock({ block, onAnswered }: { block: OrderData; onAnswered: (firstTry: boolean) => void }) {
  const dealt = useMemo(() => shuffleNotSolved(block.steps, block.prompt.length), [block]);
  const [items, setItems] = useState(dealt);
  const [tries, setTries] = useState(0);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const solved = result === "right";

  const move = (index: number, by: number) => {
    const target = index + by;
    if (solved || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setResult(null);
  };

  const check = () => {
    const correct = isOrderCorrect(block.steps, items);
    setResult(correct ? "right" : "wrong");
    setTries((count) => count + 1);
    if (correct) onAnswered(tries === 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold leading-snug text-foreground">{block.prompt}</h2>
      <p className="mt-2 text-sm text-muted-foreground">Drag the cards, or use the arrows, to put them in order.</p>
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={(next) => {
          if (solved) return;
          setItems(next);
          setResult(null);
        }}
        className="mt-4 space-y-2"
      >
        {items.map((item, index) => (
          <Reorder.Item
            key={item}
            value={item}
            dragListener={!solved}
            className="flex cursor-grab touch-pan-x items-center gap-2 rounded-2xl border border-border bg-card p-3 text-base text-foreground active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="flex-1">{item}</span>
            <span className="flex shrink-0 flex-col">
              <button type="button" className="p-1 disabled:opacity-30" aria-label={`Move "${item}" up`} disabled={index === 0 || solved} onClick={() => move(index, -1)}>
                <ChevronUp className="h-5 w-5" />
              </button>
              <button type="button" className="p-1 disabled:opacity-30" aria-label={`Move "${item}" down`} disabled={index === items.length - 1 || solved} onClick={() => move(index, 1)}>
                <ChevronDown className="h-5 w-5" />
              </button>
            </span>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {!solved && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={check}
          className="mt-4 h-11 rounded-full border border-primary px-5 text-sm font-semibold text-primary"
        >
          Check my order
        </motion.button>
      )}
      {result && (
        <Feedback good={solved}>{solved ? block.explanation : "Nearly there. Move a card or two and check again."}</Feedback>
      )}
    </div>
  );
}
