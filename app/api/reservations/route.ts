import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body: {
    productId: string;
    warehouseId: string;
    quantity: number;
    } = await req.json();

    const { productId, warehouseId, quantity } = body;

    if (!productId || !warehouseId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const inventoryRows = await tx.$queryRawUnsafe<
        {
          id: string;
          totalStock: number;
          reservedStock: number;
        }[]
      >(
        `
        SELECT *
        FROM "Inventory"
        WHERE "productId" = $1
        AND "warehouseId" = $2
        FOR UPDATE
        `,
        productId,
        warehouseId
      );

      const inventory = inventoryRows[0];

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      const availableStock =
        inventory.totalStock - inventory.reservedStock;

      if (availableStock < quantity) {
        return {
          error: "Insufficient stock",
          status: 409,
        };
      }

      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          reservedStock: {
            increment: quantity,
          },
        },
      });

      const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
      );

      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          expiresAt,
        },
      });

      return {
        reservation,
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