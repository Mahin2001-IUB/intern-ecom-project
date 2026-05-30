"use client";

import StoreInfo from "@/components/admin/StoreInfo";
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    try {
      const res = await fetch("/api/admin/stores", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch stores");
      }

      setStores(data.stores);
    } catch (error) {
      console.error("FETCH_ADMIN_STORES_ERROR:", error);
      toast.error(error.message || "Failed to fetch stores");
    } finally {
      setLoading(false);
    }
  };

  const toggleIsActive = async (storeId) => {
    const store = stores.find((item) => item.id === storeId);

    if (!store) {
      throw new Error("Store not found");
    }

    const res = await fetch(`/api/admin/stores/${storeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive: !store.isActive,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update store");
    }

    setStores((prevStores) =>
      prevStores.map((item) =>
        item.id === storeId
          ? { ...item, isActive: data.store.isActive }
          : item
      )
    );

    return data;
  };

  const updateStoreStatus = async (storeId, status) => {
    const res = await fetch(`/api/admin/stores/${storeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        isActive: status === "approved",
      }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update store status");
    }

    setStores((prevStores) =>
      prevStores.map((item) =>
        item.id === storeId
          ? {
              ...item,
              status: data.store.status,
              isActive: data.store.isActive,
            }
          : item
      )
    );

    return data;
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return !loading ? (
    <div className="text-slate-500 mb-28">
      <h1 className="text-2xl">
        Live <span className="text-slate-800 font-medium">Stores</span>
      </h1>

      {stores.length ? (
        <div className="flex flex-col gap-4 mt-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-5xl"
            >
              <StoreInfo store={store} />

              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-slate-400">Status</p>

                  <select
                    value={store.status}
                    onChange={(e) =>
                      toast.promise(
                        updateStoreStatus(store.id, e.target.value),
                        {
                          loading: "Updating status...",
                          success: "Store status updated!",
                          error: (err) =>
                            err.message || "Failed to update status",
                        }
                      )
                    }
                    className="border border-slate-300 rounded px-2 py-1 text-sm outline-none"
                  >
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <p>Active</p>

                  <label className="relative inline-flex items-center cursor-pointer text-gray-900">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      onChange={() =>
                        toast.promise(toggleIsActive(store.id), {
                          loading: "Updating data...",
                          success: "Store active status updated!",
                          error: (err) =>
                            err.message || "Failed to update store",
                        })
                      }
                      checked={store.isActive}
                      readOnly
                    />

                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>

                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-80">
          <h1 className="text-3xl text-slate-400 font-medium">
            No stores Available
          </h1>
        </div>
      )}
    </div>
  ) : (
    <Loading />
  );
}