"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { DeleteIcon } from "lucide-react";
import Loading from "@/components/Loading";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discount: "",
    forNewUser: false,
    forMember: false,
    isPublic: true,
    expiresAt: new Date().toISOString().slice(0, 10),
  });

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch coupons");
      }

      setCoupons(data.coupons);
    } catch (error) {
      console.error("FETCH_COUPONS_ERROR:", error);
      toast.error(error.message || "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newCoupon,
        code: newCoupon.code.trim().toUpperCase(),
        discount: Number(newCoupon.discount),
      }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to add coupon");
    }

    setCoupons((prevCoupons) => [data.coupon, ...prevCoupons]);

    setNewCoupon({
      code: "",
      description: "",
      discount: "",
      forNewUser: false,
      forMember: false,
      isPublic: true,
      expiresAt: new Date().toISOString().slice(0, 10),
    });

    return data;
  };

  const handleChange = (e) => {
    setNewCoupon({
      ...newCoupon,
      [e.target.name]: e.target.value,
    });
  };

  const deleteCoupon = async (code) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete coupon ${code}?`
    );

    if (!confirmDelete) {
      throw new Error("Delete cancelled");
    }

    const res = await fetch(`/api/admin/coupons/${encodeURIComponent(code)}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to delete coupon");
    }

    setCoupons((prevCoupons) =>
      prevCoupons.filter((coupon) => coupon.code !== code)
    );

    return data;
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 mb-40">
      <form
        onSubmit={(e) =>
          toast.promise(handleAddCoupon(e), {
            loading: "Adding coupon...",
            success: "Coupon added successfully!",
            error: (err) => err.message || "Failed to add coupon",
          })
        }
        className="max-w-sm text-sm"
      >
        <h2 className="text-2xl">
          Add <span className="text-slate-800 font-medium">Coupons</span>
        </h2>

        <div className="flex gap-2 max-sm:flex-col mt-2">
          <input
            type="text"
            placeholder="Coupon Code"
            className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
            name="code"
            value={newCoupon.code}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            placeholder="Coupon Discount (%)"
            min={1}
            max={100}
            className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
            name="discount"
            value={newCoupon.discount}
            onChange={handleChange}
            required
          />
        </div>

        <input
          type="text"
          placeholder="Coupon Description"
          className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
          name="description"
          value={newCoupon.description}
          onChange={handleChange}
          required
        />

        <label>
          <p className="mt-3">Coupon Expiry Date</p>
          <input
            type="date"
            className="w-full mt-1 p-2 border border-slate-200 outline-slate-400 rounded-md"
            name="expiresAt"
            value={newCoupon.expiresAt}
            onChange={handleChange}
            required
          />
        </label>

        <div className="mt-5">
          <div className="flex gap-2 mt-3">
            <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
              <input
                type="checkbox"
                className="sr-only peer"
                name="forNewUser"
                checked={newCoupon.forNewUser}
                onChange={(e) =>
                  setNewCoupon({
                    ...newCoupon,
                    forNewUser: e.target.checked,
                  })
                }
              />
              <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
              <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
            </label>
            <p>For New User</p>
          </div>

          <div className="flex gap-2 mt-3">
            <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
              <input
                type="checkbox"
                className="sr-only peer"
                name="forMember"
                checked={newCoupon.forMember}
                onChange={(e) =>
                  setNewCoupon({
                    ...newCoupon,
                    forMember: e.target.checked,
                  })
                }
              />
              <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
              <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
            </label>
            <p>For Member</p>
          </div>

          <div className="flex gap-2 mt-3">
            <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
              <input
                type="checkbox"
                className="sr-only peer"
                name="isPublic"
                checked={newCoupon.isPublic}
                onChange={(e) =>
                  setNewCoupon({
                    ...newCoupon,
                    isPublic: e.target.checked,
                  })
                }
              />
              <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
              <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
            </label>
            <p>Public / Usable in checkout</p>
          </div>
        </div>

        <button className="mt-4 p-2 px-10 rounded bg-slate-700 text-white active:scale-95 transition">
          Add Coupon
        </button>
      </form>

      <div className="mt-14">
        <h2 className="text-2xl">
          List <span className="text-slate-800 font-medium">Coupons</span>
        </h2>

        <div className="overflow-x-auto mt-4 rounded-lg border border-slate-200 max-w-5xl">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Code</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Description</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Discount</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Expires At</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">New User</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Member</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Public</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {coupons.map((coupon) => (
                <tr key={coupon.code} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {coupon.code}
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    {coupon.description}
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    {coupon.discount}%
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    {format(new Date(coupon.expiresAt), "yyyy-MM-dd")}
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    {coupon.forNewUser ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    {coupon.forMember ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    {coupon.isPublic ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    <DeleteIcon
                      onClick={() =>
                        toast.promise(deleteCoupon(coupon.code), {
                          loading: "Deleting coupon...",
                          success: "Coupon deleted successfully!",
                          error: (err) => err.message || "Failed to delete coupon",
                        })
                      }
                      className="w-5 h-5 text-red-500 hover:text-red-800 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}

              {coupons.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 px-4 text-center text-slate-400">
                    No coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}