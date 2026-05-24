import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { reservationSchema } from "@/lib/validators";
import { formatZodError } from "@/lib/errors";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed =
      reservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: formatZodError(
            parsed.error
          ),
        },
        { status: 400 }
      );
    }

    const {
      productId,
      warehouseId,
      quantity,
    } = parsed.data;

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
        // Date.now() + 15 * 1000 //For expiry test
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