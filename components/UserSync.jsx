"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserSync() {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        await fetch("/api/user/sync", {
          method: "POST",
        });
      } catch (error) {
        console.error("USER_SYNC_ERROR:", error);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn]);

  return null;
}