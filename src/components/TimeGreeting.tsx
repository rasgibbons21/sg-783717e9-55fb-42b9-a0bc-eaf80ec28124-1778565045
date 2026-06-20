import { useMemo } from "react";

function getGreeting(): string {
  const h = new Date().getHours(); // browser local time
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  return "Good evening";
}

function toFirstName(fullName?: string | null): string | null {
  const token = fullName?.trim().split(/\s+/)[0];
  if (!token) return null;
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

export function TimeGreeting({ fullName }: { fullName?: string | null }) {
  const greeting = useMemo(getGreeting, []); // stable for the page session
  const firstName = toFirstName(fullName);

  return (
    <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
      <span className="text-[#c8953a]">{greeting}</span>
      {firstName ? `, ${firstName}` : ""} 🌸
    </h1>
  );
}
