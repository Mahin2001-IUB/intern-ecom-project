"use client";

import StoreInfo from "@/components/admin/StoreInfo";
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminApprove() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    try {
      const res = await fetch("/api/admin/stores", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch store applications");
      }

      const pendingStores = data.stores.filter(
        (store) => store.status === "pending"
      );

      setStores(pendingStores);
    } catch (error) {
      console.error("FETCH_PENDING_STORES_ERROR:", error);
      toast.error(error.message || "Failed to fetch store applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async ({ storeId, status }) => {
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
      throw new Error(data.message || "Failed to update store application");
    }

    setStores((prevStores) =>
      prevStores.filter((store) => store.id !== storeId)
    );

    return data;
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return !loading ? (
    <div className="text-slate-500 mb-28">
      <h1 className="text-2xl">
        Approve <span className="text-slate-800 font-medium">Stores</span>
      </h1>

      {stores.length ? (
        <div className="flex flex-col gap-4 mt-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white border rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-4xl"
            >
              <StoreInfo store={store} />

              <div className="flex gap-3 pt-2 flex-wrap">
                <button
                  onClick={() =>
                    toast.promise(
                      handleApprove({
                        storeId: store.id,
                        status: "approved",
                      }),
                      {
                        loading: "Approving store...",
                        success: "Store approved successfully!",
                        error: (err) =>
                          err.message || "Failed to approve store",
                      }
                    )
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    toast.promise(
                      handleApprove({
                        storeId: store.id,
                        status: "rejected",
                      }),
                      {
                        loading: "Rejecting store...",
                        success: "Store rejected successfully!",
                        error: (err) =>
                          err.message || "Failed to reject store",
                      }
                    )
                  }
                  className="px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-80">
          <h1 className="text-3xl text-slate-400 font-medium">
            No Application Pending
          </h1>
        </div>
      )}
    </div>
  ) : (
    <Loading />
  );
}