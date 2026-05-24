"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-violet-950/10 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-end">
            <ThemeToggle />
        </div>

        <Card
            className="
            border-white/10
            bg-background/70
            backdrop-blur
            shadow-2xl
            shadow-black/20
            "
        >
            <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                <CardTitle className="text-4xl font-black tracking-tight bg-gradient-to-r from-violet-500 to-rose-500 bg-clip-text text-transparent">
                    Reservation Checkout
                </CardTitle>

                <p className="text-muted-foreground">
                    Confirm or release your
                    inventory reservation.
                </p>
                </div>

                <Badge
                className={
                    reservation.status ===
                    "CONFIRMED"
                    ? "bg-violet-500 text-white"
                    : reservation.status ===
                        "RELEASED"
                        ? "bg-rose-600 text-white"
                        : "bg-zinc-700 text-white"
                }
                >
                {reservation.status}
                </Badge>
            </div>
            </CardHeader>

            <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-muted/20 p-4 space-y-1">
                <p className="text-sm text-muted-foreground">
                    Product
                </p>

                <p className="font-semibold text-lg">
                    {reservation.product.name}
                </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-muted/20 p-4 space-y-1">
                <p className="text-sm text-muted-foreground">
                    Warehouse
                </p>

                <p className="font-semibold text-lg">
                    {reservation.warehouse.name}
                </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-muted/20 p-4 space-y-1">
                <p className="text-sm text-muted-foreground">
                    Quantity
                </p>

                <p className="font-semibold text-lg">
                    {reservation.quantity}
                </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-muted/20 p-4 space-y-1">
                <p className="text-sm text-muted-foreground">
                    Reservation ID
                </p>

                <p className="font-mono text-xs truncate">
                    {reservation.id}
                </p>
                </div>
            </div>

            {reservation.status ===
                "PENDING" && (
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8 space-y-6">
                <div className="space-y-3 text-center">
                    <p className="text-muted-foreground">
                    Reservation expires in
                    </p>

                    <p className="text-6xl font-black tracking-tight text-violet-400">
                    {formatTime(timeLeft)}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                    onClick={
                        confirmReservation
                    }
                    disabled={timeLeft <= 0}
                    className="
                        flex-1
                        bg-violet-600
                        hover:bg-violet-500
                        text-white
                        transition-all
                        duration-200
                        hover:scale-[1.02]
                        active:scale-[0.98]
                        shadow-lg
                        shadow-violet-500/20
                    "
                    >
                    Confirm Purchase
                    </Button>

                    <Button
                    variant="destructive"
                    onClick={
                        cancelReservation
                    }
                    className="
                        flex-1
                        bg-rose-600
                        hover:bg-rose-500
                        text-white
                        transition-all
                        duration-200
                        hover:scale-[1.02]
                        active:scale-[0.98]
                        shadow-lg
                        shadow-rose-500/20
                    "
                    >
                    Cancel Reservation
                    </Button>
                </div>
                </div>
            )}

            {reservation.status !==
                "PENDING" && (
                <div className="rounded-xl border border-white/10 bg-muted/20 p-8 text-center space-y-2">
                <p className="text-2xl font-bold">
                    Reservation Completed
                </p>

                <p className="text-muted-foreground">
                    This reservation is no
                    longer active.
                </p>
                </div>
            )}

            <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="
                transition-all
                duration-200
                hover:scale-[1.02]
                "
            >
                Back to Products
            </Button>
            </CardContent>
        </Card>
        </div>
    </main>
    );
}