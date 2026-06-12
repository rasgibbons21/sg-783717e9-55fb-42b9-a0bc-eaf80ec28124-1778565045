import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ProPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to subscription page (Bloom Pro)
    router.push("/subscription");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF7F2" }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#C4714A", borderTopColor: "transparent" }} />
        <p style={{ color: "#2D4A3E" }}>Loading Bloom Pro...</p>
      </div>
    </div>
  );
}