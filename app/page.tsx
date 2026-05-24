"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");

      const data = await res.json();

      setProducts(data);
    } catch {
      toast.error("Failed to load products");
    }
  }

  async function reserve(
    productId: string,
    warehouseId: string
  ) {
    try {
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

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("Reservation created");

      router.push(`/reservations/${data.id}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-violet-950/10 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-violet-500 to-rose-600 bg-clip-text text-transparent">
              Inventory Reservation System
            </h1>

            <p className="text-muted-foreground text-lg">
              Real-time warehouse inventory
              reservation with transactional
              locking.
            </p>
          </div>

          <ThemeToggle />
        </div>

        <div className="grid gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="
                border-white/10
                bg-background/70
                backdrop-blur
                shadow-2xl
                shadow-black/10
                transition-all
                duration-300
                hover:shadow-violet-500/10
                hover:-translate-y-1
              "
            >
              <CardHeader>
                <CardTitle className="text-2xl">
                  {product.name}
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                {product.inventories.map(
                  (inventory) => {
                    const available =
                      inventory.totalStock -
                      inventory.reservedStock;

                    return (
                      <div
                        key={inventory.id}
                        className="
                          flex items-center justify-between
                          rounded-xl border border-white/10
                          bg-muted/30
                          p-4
                          transition-all
                          duration-200
                          hover:bg-muted/50
                        "
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-lg">
                            {
                              inventory.warehouse
                                .name
                            }
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {
                              inventory.warehouse
                                .location
                            }
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <Badge
                            className={
                              available > 0
                                ? "bg-rose-600 hover:bg-rose-600 text-white"
                                : ""
                            }
                            variant={
                              available > 0
                                ? "default"
                                : "destructive"
                            }
                          >
                            {available} Available
                          </Badge>

                          <Button
                            onClick={() =>
                              reserve(
                                product.id,
                                inventory
                                  .warehouse.id
                              )
                            }
                            disabled={
                              loading ||
                              available <= 0
                            }
                            className="
                              bg-violet-600
                              hover:bg-violet-500
                              transition-all
                              duration-200
                              hover:scale-105
                              active:scale-95
                              shadow-lg
                              shadow-violet-500/20
                              text-white
                            "
                          >
                            Reserve
                          </Button>
                        </div>
                      </div>
                    );
                  }
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}