"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();

    setProducts(data);
  }

  async function reserve(
    productId: string,
    warehouseId: string
  ) {
    setLoading(true);

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        warehouseId,
        quantity: 1,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(data.error);
      return;
    }

    router.push(`/reservations/${data.id}`);
  }

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        Inventory System
      </h1>

      {products.map((product) => (
        <div
          key={product.id}
          className="border rounded-lg p-4 space-y-3"
        >
          <div>
            <h2 className="text-xl font-semibold">
              {product.name}
            </h2>

            <p className="text-gray-500">
              {product.description}
            </p>
          </div>

          <div className="space-y-2">
            {product.inventories.map((inventory) => {
              const available =
                inventory.totalStock -
                inventory.reservedStock;

              return (
                <div
                  key={inventory.id}
                  className="flex items-center justify-between border rounded p-3"
                >
                  <div>
                    <p className="font-medium">
                      {inventory.warehouse.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Available: {available}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      reserve(
                        product.id,
                        inventory.warehouse.id
                      )
                    }
                    disabled={loading || available <= 0}
                    className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    Reserve
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </main>
  );
}