"use client";

import Loading from "@/components/Loading";
import OrdersAreaChart from "@/components/OrdersAreaChart";
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StoreIcon,
  TagsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    products: 0,
    revenue: 0,
    orders: 0,
    stores: 0,
    allOrders: [],
  });

  const dashboardCardsData = [
    {
      title: "Total Products",
      value: dashboardData.products,
      icon: ShoppingBasketIcon,
    },
    {
      title: "Total Revenue",
      value: currency + Number(dashboardData.revenue).toLocaleString(),
      icon: CircleDollarSignIcon,
    },
    {
      title: "Total Orders",
      value: dashboardData.orders,
      icon: TagsIcon,
    },
    {
      title: "Total Stores",
      value: dashboardData.stores,
      icon: StoreIcon,
    },
  ];

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }

      setDashboardData(data.dashboardData);
    } catch (error) {
      console.error("FETCH_ADMIN_DASHBOARD_ERROR:", error);
      toast.error(error.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500">
      <h1 className="text-2xl">
        Admin <span className="text-slate-800 font-medium">Dashboard</span>
      </h1>

      <div className="flex flex-wrap gap-5 my-10 mt-4">
        {dashboardCardsData.map((card, index) => (
          <div
            key={index}
            className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg"
          >
            <div className="flex flex-col gap-3 text-xs">
              <p>{card.title}</p>
              <b className="text-2xl font-medium text-slate-700">
                {card.value}
              </b>
            </div>

            <card.icon
              size={50}
              className="w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full"
            />
          </div>
        ))}
      </div>

      <OrdersAreaChart allOrders={dashboardData.allOrders} />
    </div>
  );
}