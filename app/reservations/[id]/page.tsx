"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
    const res = await fetch(
      `/api/reservations/${params.id}`
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setReservation(data);
  }

  useEffect(() => {
    fetchReservation();
  }, []);

  useEffect(() => {
    if (!reservation) return;

    const interval = setInterval(() => {
      const remaining =
        new Date(reservation.expiresAt).getTime() -
        Date.now();

      setTimeLeft(Math.max(0, remaining));

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  async function confirmReservation() {
    const res = await fetch(
      `/api/reservations/${params.id}/confirm`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    //setReservation(data);
    await fetchReservation();
  }

  async function cancelReservation() {
    const res = await fetch(
      `/api/reservations/${params.id}/release`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    // setReservation(data);
    await fetchReservation();
  }

  if (!reservation) {
    return (
      <main className="p-8">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="max-w-xl border rounded-lg p-6 space-y-4">
        <h1 className="text-3xl font-bold">
          Reservation Checkout
        </h1>

        <div>
          <p className="font-medium">
            Product: {reservation.product.name}
          </p>

          <p className="font-medium">
            Warehouse: {reservation.warehouse.name}
          </p>

          <p className="font-medium">
            Quantity: {reservation.quantity}
          </p>

          <p className="font-medium">
            Status: {reservation.status}
          </p>
        </div>

        {reservation.status === "PENDING" && (
          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold">
                Time Remaining
              </p>

              <p className="text-2xl">
                {Math.floor(timeLeft / 1000)}s
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmReservation}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Confirm Purchase
              </button>

              <button
                onClick={cancelReservation}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {reservation.status !== "PENDING" && (
          <p className="text-lg font-semibold">
            Reservation completed.
          </p>
        )}

        <button
          onClick={() => router.push("/")}
          className="border px-4 py-2 rounded"
        >
          Back
        </button>
      </div>
    </main>
  );
}