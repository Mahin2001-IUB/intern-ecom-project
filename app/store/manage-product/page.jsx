"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Loading from "@/components/Loading";

export default function StoreManageProducts() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data.products);
    } catch (error) {
      console.error("FETCH_PRODUCTS_ERROR:", error);
      toast.error(error.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const toggleStock = async (productId) => {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const res = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inStock: !product.inStock,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update product");
    }

    setProducts((prevProducts) =>
      prevProducts.map((item) =>
        item.id === productId
          ? { ...item, inStock: data.product.inStock }
          : item
      )
    );

    return data;
  };

  const deleteProduct = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    const res = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to delete product");
    }

    setProducts((prevProducts) =>
      prevProducts.filter((item) => item.id !== productId)
    );

    return data;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <h1 className="text-2xl text-slate-500 mb-5">
        Manage{" "}
        <span className="text-slate-800 font-medium">Products</span>
      </h1>

      <table className="w-full max-w-5xl text-left ring ring-slate-200 rounded overflow-hidden text-sm">
        <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3 hidden md:table-cell">Description</th>
            <th className="px-4 py-3 hidden md:table-cell">MRP</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Delete</th>
          </tr>
        </thead>

        <tbody className="text-slate-700">
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-t border-gray-200 hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                <div className="flex gap-2 items-center">
                  <Image
                    width={40}
                    height={40}
                    className="p-1 shadow rounded cursor-pointer object-cover"
                    src={product.images?.[0] || "/products/product_img1.png"}
                    alt={product.name}
                  />
                  {product.name}
                </div>
              </td>

              <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">
                {product.description}
              </td>

              <td className="px-4 py-3 hidden md:table-cell">
                {currency} {Number(product.mrp).toLocaleString()}
              </td>

              <td className="px-4 py-3">
                {currency} {Number(product.price).toLocaleString()}
              </td>

              <td className="px-4 py-3 text-center">
                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={() =>
                      toast.promise(toggleStock(product.id), {
                        loading: "Updating stock...",
                        success: "Stock updated successfully!",
                        error: (err) =>
                          err.message || "Failed to update stock",
                      })
                    }
                    checked={product.inStock}
                    readOnly
                  />
                  <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                  <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                </label>
              </td>

              <td className="px-4 py-3">
                <button
                  onClick={() =>
                    toast.promise(deleteProduct(product.id), {
                      loading: "Deleting product...",
                      success: "Product deleted successfully!",
                      error: (err) =>
                        err.message || "Failed to delete product",
                    })
                  }
                  className="px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {products.length === 0 && (
        <p className="text-slate-500 mt-5">No products found.</p>
      )}
    </>
  );
}