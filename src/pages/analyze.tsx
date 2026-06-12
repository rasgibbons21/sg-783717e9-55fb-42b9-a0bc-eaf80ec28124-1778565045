import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AnalyzePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to discover page (stock analyzer)
    router.push("/discover");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF7F2" }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#C4714A", borderTopColor: "transparent" }} />
        <p style={{ color: "#2D4A3E" }}>Loading analyzer...</p>
      </div>
    </div>
  );
}