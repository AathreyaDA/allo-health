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
    <main className="min-h-screen bg-muted/40 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Inventory Reservation System
          </h1>

          <p className="text-muted-foreground">
            Reserve inventory across warehouses
            with real-time stock tracking.
          </p>
        </div>

        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>
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
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">
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
                                inventory.warehouse
                                  .id
                              )
                            }
                            disabled={
                              loading ||
                              available <= 0
                            }
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