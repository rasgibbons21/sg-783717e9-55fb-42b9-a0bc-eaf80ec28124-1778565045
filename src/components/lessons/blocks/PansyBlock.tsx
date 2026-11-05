import { BloomMark } from "@/components/brand/BloomMark";

export function PansyBlock({ body }: { body: string }) {
  return (
    <div className="flex gap-3 rounded-3xl bg-accent/60 p-5">
      <div className="shrink-0">
        <BloomMark size={40} />
      </div>
      <div>
        <p className="font-serif text-base font-semibold text-foreground">Pansy</p>
        <p className="mt-1 text-base leading-relaxed text-foreground">{body}</p>
      </div>
    </div>
  );
}
