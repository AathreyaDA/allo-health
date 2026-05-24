import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


const paramsSchema = z.object({
  id: z.string().min(1),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await params;

const parsedParams =
  paramsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return NextResponse.json(
      {
        error: "Invalid reservation ID",
        details:
          parsedParams.error.issues.map(
            (issue) => ({
              field:
                issue.path.join("."),
              message:
                issue.message,
            })
          ),
      },
      { status: 400 }
    );
  }

  const { id } = parsedParams.data;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        product: true,
        warehouse: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}