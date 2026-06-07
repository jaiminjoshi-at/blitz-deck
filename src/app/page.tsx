
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  console.log("🏠 Home (/) route called");
  const session = await auth();
  console.log("🏠 Home session user:", session?.user ? { id: session.user.id, email: session.user.email, role: session.user.role } : "none");

  if (session?.user) {
    if ((session.user as { role?: string }).role === 'admin') {
      console.log("🏠 Home redirecting to /admin");
      redirect('/admin');
    }
    console.log("🏠 Home redirecting to /dashboard");
    redirect('/dashboard');
  }

  console.log("🏠 Home redirecting to /login");
  redirect('/login');
}
