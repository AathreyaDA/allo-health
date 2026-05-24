"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";

interface Reservation {
  id: string;
  status: string;
  quantity: number;
  expiresAt: string;

  product: {
    name: string;
  };

  warehouse: {
    name: string;
  };
}

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [timeLeft, setTimeLeft] = useState(0);

  async function fetchReservation() {
    try {
      const res = await fetch(
        `/api/reservations/${params.id}`
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setReservation(data);
    } catch {
      toast.error(
        "Failed to fetch reservation"
      );
    }
  }

  useEffect(() => {
    fetchReservation();
  }, []);

  useEffect(() => {
    if (!reservation) return;

    const interval = setInterval(() => {
      const remaining =
        new Date(
          reservation.expiresAt
        ).getTime() - Date.now();

      setTimeLeft(Math.max(0, remaining));

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  async function confirmReservation() {
    try {
      const res = await fetch(
        `/api/reservations/${params.id}/confirm`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success(
        "Reservation confirmed"
      );

      await fetchReservation();
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function cancelReservation() {
    try {
      const res = await fetch(
        `/api/reservations/${params.id}/release`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success(
        "Reservation released"
      );

      await fetchReservation();
    } catch {
      toast.error("Something went wrong");
    }
  }

  function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);

    const minutes = Math.floor(
      totalSeconds / 60
    );

    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  if (!reservation) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Loading reservation...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl">
                Reservation Checkout
              </CardTitle>

              <Badge
                variant={
                  reservation.status ===
                  "CONFIRMED"
                    ? "default"
                    : reservation.status ===
                        "RELEASED"
                      ? "secondary"
                      : "outline"
                }
              >
                {reservation.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Product
                </p>

                <p className="font-semibold">
                  {reservation.product.name}
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Warehouse
                </p>

                <p className="font-semibold">
                  {
                    reservation.warehouse
                      .name
                  }
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Quantity
                </p>

                <p className="font-semibold">
                  {reservation.quantity}
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Reservation ID
                </p>

                <p className="font-mono text-sm truncate">
                  {reservation.id}
                </p>
              </div>
            </div>

            {reservation.status ===
              "PENDING" && (
              <div className="rounded-xl border bg-background p-6 space-y-4">
                <div className="space-y-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Reservation expires in
                  </p>

                  <p className="text-5xl font-bold tracking-tight">
                    {formatTime(timeLeft)}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={
                      confirmReservation
                    }
                    className="flex-1"
                    disabled={timeLeft <= 0}
                  >
                    Confirm Purchase
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={
                      cancelReservation
                    }
                    className="flex-1"
                  >
                    Cancel Reservation
                  </Button>
                </div>
              </div>
            )}

            {reservation.status !==
              "PENDING" && (
              <div className="rounded-lg border p-6 text-center">
                <p className="text-lg font-semibold">
                  Reservation completed
                </p>

                <p className="text-muted-foreground mt-1">
                  This reservation is no
                  longer active.
                </p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => router.push("/")}
            >
              Back to Products
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}