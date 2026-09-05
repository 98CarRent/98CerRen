import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const admin = await verifyAdmin();
  if (admin) redirect("/admin");
  return <LoginForm />;
}