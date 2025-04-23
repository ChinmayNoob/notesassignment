import { UserAccount } from "@/components/user-account";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <UserAccount user={user} />
    </div>

  );
}
