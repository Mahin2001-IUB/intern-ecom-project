"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Loading from "@/components/Loading";

export default function StoreManageProducts() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    mrp: "",
    price: "",
  });

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

    if (!confirmDelete) {
      throw new Error("Delete cancelled");
    }

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

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      mrp: product.mrp || "",
      price: product.price || "",
    });
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditForm({
      name: "",
      description: "",
      category: "",
      mrp: "",
      price: "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const updateProduct = async (e) => {
    e.preventDefault();

    if (!editingProduct) {
      throw new Error("No product selected");
    }

    if (
      !editForm.name ||
      !editForm.description ||
      !editForm.category ||
      !editForm.mrp ||
      !editForm.price
    ) {
      throw new Error("All fields are required");
    }

    const res = await fetch(`/api/products/${editingProduct.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        mrp: editForm.mrp,
        price: editForm.price,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update product");
    }

    setProducts((prevProducts) =>
      prevProducts.map((item) =>
        item.id === editingProduct.id ? { ...item, ...data.product } : item
      )
    );

    closeEditModal();

    return data;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <h1 className="text-2xl text-slate-500 mb-5">
        Manage <span className="text-slate-800 font-medium">Products</span>
      </h1>

      <table className="w-full max-w-6xl text-left ring ring-slate-200 rounded overflow-hidden text-sm">
        <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3 hidden md:table-cell">Description</th>
            <th className="px-4 py-3 hidden lg:table-cell">Category</th>
            <th className="px-4 py-3 hidden md:table-cell">MRP</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Actions</th>
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

              <td className="px-4 py-3 hidden lg:table-cell">
                {product.category}
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
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="px-3 py-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      toast.promise(deleteProduct(product.id), {
                        loading: "Deleting product...",
                        success: "Product deleted successfully!",
                        error: (err) =>
                          err.message === "Delete cancelled"
                            ? "Delete cancelled"
                            : err.message || "Failed to delete product",
                      })
                    }
                    className="px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {products.length === 0 && (
        <p className="text-slate-500 mt-5">No products found.</p>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <form
            onSubmit={(e) =>
              toast.promise(updateProduct(e), {
                loading: "Updating product...",
                success: "Product updated successfully!",
                error: (err) => err.message || "Failed to update product",
              })
            }
            className="bg-white w-full max-w-lg mx-5 rounded-xl shadow-lg p-6 text-slate-700"
          >
            <h2 className="text-2xl font-medium mb-5">
              Edit <span className="text-slate-900">Product</span>
            </h2>

            <div className="flex flex-col gap-4">
              <input
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                className="border border-slate-200 rounded px-4 py-2 outline-none"
                placeholder="Product name"
                required
              />

              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                className="border border-slate-200 rounded px-4 py-2 outline-none min-h-24"
                placeholder="Product description"
                required
              />

              <input
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
                className="border border-slate-200 rounded px-4 py-2 outline-none"
                placeholder="Category"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  name="mrp"
                  value={editForm.mrp}
                  onChange={handleEditChange}
                  className="border border-slate-200 rounded px-4 py-2 outline-none"
                  type="number"
                  placeholder="MRP"
                  required
                />

                <input
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  className="border border-slate-200 rounded px-4 py-2 outline-none"
                  type="number"
                  placeholder="Price"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded bg-slate-800 text-white hover:bg-slate-900 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}