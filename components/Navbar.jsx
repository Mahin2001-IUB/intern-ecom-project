"use client";

import {
  MenuIcon,
  Search,
  ShoppingCart,
  XIcon,
  ChevronDownIcon,
  LayoutDashboardIcon,
  PackageIcon,
  StoreIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

const Navbar = () => {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [storeLoading, setStoreLoading] = useState(false);

  const cartCount = useSelector((state) => state.cart.total);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    router.push(`/shop?search=${search}`);
    setMobileMenuOpen(false);
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
      setAccountDropdownOpen(false);
    }
  }, [isLoaded, isSignedIn]);

  const userDisplayName =
    user?.firstName ||
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    "User";

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
  };

  const StoreDropdownItem = () => {
    if (storeLoading) return null;

    if (!storeInfo) {
      return (
        <Link
          href="/create-store"
          onClick={closeMenus}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 text-green-600"
        >
          <StoreIcon size={17} />
          Apply for Store
        </Link>
      );
    }

    if (storeInfo.status === "pending") {
      return (
        <div className="flex items-center gap-2 px-4 py-2 text-yellow-600 cursor-default">
          <StoreIcon size={17} />
          Store Pending
        </div>
      );
    }

    if (storeInfo.status === "rejected") {
      return (
        <Link
          href="/create-store"
          onClick={closeMenus}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 text-red-500"
        >
          <StoreIcon size={17} />
          Reapply Store
        </Link>
      );
    }

    if (storeInfo.status === "approved" && storeInfo.isActive) {
      return (
        <Link
          href="/store"
          onClick={closeMenus}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 text-green-600"
        >
          <StoreIcon size={17} />
          Store Panel
        </Link>
      );
    }

    return null;
  };

  const CartButton = ({ mobile = false }) => {
    const cartContent = (
      <div
        className={`relative flex items-center gap-2 text-slate-600 ${
          mobile ? "py-2" : ""
        }`}
      >
        <ShoppingCart size={18} />
        <span>Cart</span>

        <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">
          {cartCount}
        </span>
      </div>
    );

    if (!isSignedIn) {
      return (
        <SignInButton mode="modal">
          <button>{cartContent}</button>
        </SignInButton>
      );
    }

    return (
      <Link href="/cart" onClick={closeMenus}>
        {cartContent}
      </Link>
    );
  };

  const AccountDropdown = ({ mobile = false }) => {
    return (
      <div className={mobile ? "w-full" : "relative"}>
        <button
          onClick={() => setAccountDropdownOpen((prev) => !prev)}
          className={`flex items-center gap-1 text-slate-700 ${
            mobile
              ? "w-full justify-between py-2"
              : "max-w-32 xl:max-w-40 truncate"
          }`}
        >
          <span className="truncate">
            Hi, <span className="font-medium">{userDisplayName}</span>
          </span>
          <ChevronDownIcon
            size={16}
            className={`transition ${
              accountDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {accountDropdownOpen && (
          <div
            className={
              mobile
                ? "mt-2 border border-slate-200 rounded-lg overflow-hidden bg-white"
                : "absolute right-0 top-9 w-52 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50"
            }
          >
            <Link
              href="/dashboard"
              onClick={closeMenus}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100"
            >
              <LayoutDashboardIcon size={17} />
              Dashboard
            </Link>

            <Link
              href="/orders"
              onClick={closeMenus}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100"
            >
              <PackageIcon size={17} />
              My Orders
            </Link>

            <StoreDropdownItem />
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="relative bg-white z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="relative shrink-0 text-3xl sm:text-4xl font-semibold text-slate-700"
            onClick={closeMenus}
          >
            <span className="text-green-600">go</span>cart
            <span className="text-green-600 text-4xl sm:text-5xl leading-0">
              .
            </span>

            <p className="absolute text-[10px] sm:text-xs font-semibold -top-1 -right-8 px-2 sm:px-3 py-0.5 rounded-full text-white bg-green-500">
              plus
            </p>
          </Link>

          {/* Desktop / Laptop Menu */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-slate-600">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/">About</Link>
            <Link href="/">Contact</Link>
          </div>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="hidden xl:flex items-center w-72 text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
          >
            <Search size={18} className="text-slate-600 shrink-0" />
            <input
              className="w-full bg-transparent outline-none placeholder-slate-600"
              type="text"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          {/* Desktop Auth Area */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-6 text-slate-600">
            <CartButton />

            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="px-7 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                  Login
                </button>
              </SignInButton>
            ) : (
              <>
                <AccountDropdown />

                <SignOutButton>
                  <button className="px-6 py-2 bg-slate-700 hover:bg-slate-900 transition text-white rounded-full">
                    Logout
                  </button>
                </SignOutButton>
              </>
            )}
          </div>

          {/* Tablet / Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <XIcon size={26} /> : <MenuIcon size={26} />}
          </button>
        </div>
      </div>

      {/* Tablet / Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
          <div className="px-5 py-5 flex flex-col gap-4 text-slate-600">
            <form
              onSubmit={handleSearch}
              className="flex items-center text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
            >
              <Search size={18} className="text-slate-600 shrink-0" />
              <input
                className="w-full bg-transparent outline-none placeholder-slate-600"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            <Link href="/" onClick={closeMenus}>
              Home
            </Link>

            <Link href="/shop" onClick={closeMenus}>
              Shop
            </Link>

            <Link href="/" onClick={closeMenus}>
              About
            </Link>

            <Link href="/" onClick={closeMenus}>
              Contact
            </Link>

            <CartButton mobile />

            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="w-full px-7 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full">
                  Login
                </button>
              </SignInButton>
            ) : (
              <>
                <AccountDropdown mobile />

                <SignOutButton>
                  <button className="w-full px-7 py-2 bg-slate-700 hover:bg-slate-900 text-white rounded-full">
                    Logout
                  </button>
                </SignOutButton>
              </>
            )}
          </div>
        </div>
      )}

      <hr className="border-gray-300" />
    </nav>
  );
};

export default Navbar;