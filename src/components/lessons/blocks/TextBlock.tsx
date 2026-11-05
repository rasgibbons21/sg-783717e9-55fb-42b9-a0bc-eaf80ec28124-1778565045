export function TextBlock({ body }: { body: string }) {
  return (
    <div className="space-y-4 text-lg leading-relaxed text-foreground">
      {body.split("\n\n").map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
