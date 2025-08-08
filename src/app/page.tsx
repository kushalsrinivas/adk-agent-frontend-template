import ChatApp from "~/components/ChatApp";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Header from "~/components/Header";
export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <ChatApp userId={session.user.id} />
    </div>
  );
}
