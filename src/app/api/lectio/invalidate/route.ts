import { invalidateResource } from "@/lib/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/lectio/invalidate
 * Invalidate all cached lectio data
 */
export async function POST() {
  try {
    const deletedKeys = await invalidateResource("LECTIO");

    return NextResponse.json({
      success: true,
      message: `Invalidated ${deletedKeys} cache keys`,
      deletedKeys,
    });
  } catch (error) {
    console.error("[API /lectio/invalidate] Error:", error);
    return NextResponse.json(
      { error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}
