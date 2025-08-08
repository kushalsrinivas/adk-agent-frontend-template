"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { redirect } from "next/navigation";

const Header = () => {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4 text-white backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400/80 via-fuchsia-400/80 to-emerald-400/80 shadow-[0_0_24px_rgba(255,255,255,.25)]" />
        <h1 className="text-2xl font-bold">Agent</h1>
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <Button
            className="border border-white/10 bg-white/10 text-white hover:bg-white/20"
            onClick={() => void signOut()}
          >
            Logout
          </Button>
        ) : (
          <Button
            className="border border-white/10 bg-white/10 text-white hover:bg-white/20"
            onClick={() => redirect("/api/auth/signin")}
          >
            Login
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;
