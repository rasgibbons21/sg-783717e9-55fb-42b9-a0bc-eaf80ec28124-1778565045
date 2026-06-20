// Redirect to /admin — this route was previously an unauthenticated stub.
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminDashboardRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin"); }, [router]);
  return null;
}
