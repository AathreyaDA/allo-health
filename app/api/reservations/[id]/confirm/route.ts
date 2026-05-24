import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
      });

      if (!reservation) {
        return {
          error: "Reservation not found",
          status: 404,
        };
      }

      if (reservation.status !== "PENDING") {
        return {
          error: "Reservation already processed",
          status: 400,
        };
      }

      if (reservation.expiresAt < new Date()) {
        return {
          error: "Reservation expired",
          status: 410,
        };
      }

      const inventory = await tx.inventory.findFirst({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          totalStock: {
            decrement: reservation.quantity,
          },
          reservedStock: {
            decrement: reservation.quantity,
          },
        },
      });

      const updatedReservation = await tx.reservation.update({
        where: { id },
        data: {
          status: "CONFIRMED",
        },
      });

      return {
        reservation: updatedReservation,
        status: 200,
      };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.reservation);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}