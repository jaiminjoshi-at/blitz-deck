
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    if ((session.user as { role?: string }).role === 'admin') {
      redirect('/admin');
    }
    redirect('/dashboard');
  }

  redirect('/login');
}
