"use client";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { redirect } from "next/navigation";

const Header = () => {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <div className="flex items-center justify-between bg-gray-900 p-4 text-white">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Chat</h1>
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <Button variant="default" onClick={() => void signOut()}>
            Logout
          </Button>
        ) : (
          <Button
            variant="default"
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
