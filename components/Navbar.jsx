"use client";

import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

const Navbar = () => {
    const router = useRouter();
    const { user, isSignedIn, isLoaded } = useUser();

    const [search, setSearch] = useState("");
    const [storeInfo, setStoreInfo] = useState(null);
    const [storeLoading, setStoreLoading] = useState(false);

    const cartCount = useSelector((state) => state.cart.total);

    const handleSearch = (e) => {
        e.preventDefault();
        router.push(`/shop?search=${search}`);
    };

    const fetchStoreInfo = async () => {
        if (!isSignedIn) return;

        try {
            setStoreLoading(true);

            const res = await fetch("/api/store", {
                cache: "no-store",
            });

            const data = await res.json();

            if (data.success) {
                setStoreInfo(data.store);
            }
        } catch (error) {
            console.error("FETCH_NAVBAR_STORE_ERROR:", error);
        } finally {
            setStoreLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchStoreInfo();
        }

        if (isLoaded && !isSignedIn) {
            setStoreInfo(null);
        }
    }, [isLoaded, isSignedIn]);

    const userDisplayName =
        user?.firstName ||
        user?.fullName ||
        user?.primaryEmailAddress?.emailAddress ||
        "User";

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">
                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">go</span>cart
                        <span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>

                        <form
                            onSubmit={handleSearch}
                            className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
                        >
                            <Search size={18} className="text-slate-600" />
                            <input
                                className="w-full bg-transparent outline-none placeholder-slate-600"
                                type="text"
                                placeholder="Search products"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                required
                            />
                        </form>

                        {!isSignedIn ? (
                            <>
                                <SignInButton mode="modal">
                                    <button className="relative flex items-center gap-2 text-slate-600">
                                        <ShoppingCart size={18} />
                                        Cart
                                        <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">
                                            {cartCount}
                                        </span>
                                    </button>
                                </SignInButton>

                                <SignInButton mode="modal">
                                    <button className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                                        Login
                                    </button>
                                </SignInButton>
                            </>
                        ) : (
                            <>
                                <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                                    <ShoppingCart size={18} />
                                    Cart
                                    <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">
                                        {cartCount}
                                    </span>
                                </Link>

                                <Link href="/orders" className="text-slate-600">
                                    My Orders
                                </Link>

                                {!storeLoading && !storeInfo && (
                                    <Link href="/create-store" className="text-green-600 font-medium">
                                        Apply for Store
                                    </Link>
                                )}

                                {!storeLoading && storeInfo?.status === "pending" && (
                                    <span className="text-yellow-600 font-medium">
                                        Store Pending
                                    </span>
                                )}

                                {!storeLoading && storeInfo?.status === "rejected" && (
                                    <Link href="/create-store" className="text-red-500 font-medium">
                                        Reapply Store
                                    </Link>
                                )}

                                {!storeLoading &&
                                    storeInfo?.status === "approved" &&
                                    storeInfo?.isActive && (
                                        <Link href="/store" className="text-green-600 font-medium">
                                            Store Panel
                                        </Link>
                                    )}

                                <div className="flex items-center gap-3">
                                    <p className="text-slate-700">
                                        Hi, <span className="font-medium">{userDisplayName}</span>
                                    </p>

                                    <SignOutButton>
                                        <button className="px-5 py-2 bg-slate-700 hover:bg-slate-900 transition text-white rounded-full">
                                            Logout
                                        </button>
                                    </SignOutButton>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile User Button */}
                    <div className="sm:hidden">
                        {!isSignedIn ? (
                            <SignInButton mode="modal">
                                <button className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                                    Login
                                </button>
                            </SignInButton>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/cart" className="relative flex items-center text-slate-600">
                                    <ShoppingCart size={20} />
                                    <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">
                                        {cartCount}
                                    </span>
                                </Link>

                                <SignOutButton>
                                    <button className="px-4 py-1.5 bg-slate-700 hover:bg-slate-900 text-sm transition text-white rounded-full">
                                        Logout
                                    </button>
                                </SignOutButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <hr className="border-gray-300" />
        </nav>
    );
};

export default Navbar;