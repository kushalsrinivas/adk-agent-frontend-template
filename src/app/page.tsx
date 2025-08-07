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
    <div className="flex flex-col h-screen">
      <Header />
      <ChatApp />
    </div>
  );
}
