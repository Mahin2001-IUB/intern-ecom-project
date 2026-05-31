"use client";

import Loading from "@/components/Loading";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { ArrowRightIcon, PackageIcon, StoreIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CustomerDashboard() {
  const { user, isSignedIn, isLoaded } = useUser();

  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStoreInfo = async () => {
    try {
      const res = await fetch("/api/store", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setStoreInfo(data.store);
      }
    } catch (error) {
      console.error("FETCH_CUSTOMER_STORE_STATUS_ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchStoreInfo();
    }

    if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) return <Loading />;

  if (!isSignedIn) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-semibold text-slate-700">
          Please login to access your dashboard
        </h1>

        <SignInButton mode="modal">
          <button className="mt-6 px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
            Login / Sign up
          </button>
        </SignInButton>
      </div>
    );
  }

  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    "Customer";

  return (
    <div className="min-h-[70vh] mx-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold text-slate-800">
          Customer <span className="text-green-600">Dashboard</span>
        </h1>

        <p className="text-slate-500 mt-2">
          Welcome back, {displayName}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          <div className="border border-slate-200 rounded-xl p-5 shadow-sm">
            <UserIcon className="text-slate-500" />
            <h2 className="text-xl font-medium text-slate-800 mt-4">
              My Profile
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <Link
            href="/orders"
            className="border border-slate-200 rounded-xl p-5 shadow-sm hover:bg-slate-50 transition"
          >
            <PackageIcon className="text-slate-500" />
            <h2 className="text-xl font-medium text-slate-800 mt-4">
              My Orders
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              View your order history
            </p>
          </Link>

          {!storeInfo && (
            <Link
              href="/create-store"
              className="border border-green-200 rounded-xl p-5 shadow-sm hover:bg-green-50 transition"
            >
              <StoreIcon className="text-green-600" />
              <h2 className="text-xl font-medium text-green-700 mt-4">
                Apply for Store
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Become a seller on GoCart
              </p>
            </Link>
          )}

          {storeInfo?.status === "pending" && (
            <div className="border border-yellow-200 rounded-xl p-5 shadow-sm bg-yellow-50">
              <StoreIcon className="text-yellow-600" />
              <h2 className="text-xl font-medium text-yellow-700 mt-4">
                Store Pending
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Your store application is under review.
              </p>
            </div>
          )}

          {storeInfo?.status === "rejected" && (
            <Link
              href="/create-store"
              className="border border-red-200 rounded-xl p-5 shadow-sm bg-red-50"
            >
              <StoreIcon className="text-red-600" />
              <h2 className="text-xl font-medium text-red-700 mt-4">
                Store Rejected
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Click to update and reapply.
              </p>
            </Link>
          )}

          {storeInfo?.status === "approved" && storeInfo?.isActive && (
            <Link
              href="/store"
              className="border border-green-200 rounded-xl p-5 shadow-sm hover:bg-green-50 transition"
            >
              <StoreIcon className="text-green-600" />
              <h2 className="text-xl font-medium text-green-700 mt-4">
                Store Panel
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Manage your products and orders
              </p>
            </Link>
          )}
        </div>

        <div className="mt-10 flex gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-800 text-white hover:bg-slate-900 transition"
          >
            Continue Shopping <ArrowRightIcon size={18} />
          </Link>

          <SignOutButton>
            <button className="px-6 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
              Logout
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}