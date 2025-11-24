import { invalidateResource } from "@/lib/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/lectio-sources/invalidate
 * Invalidate lectio sources cache
 */
export async function POST() {
  try {
    const deletedKeys = await invalidateResource("SOURCES");
    
    return NextResponse.json({
      success: true,
      message: `Invalidated ${deletedKeys} cache keys`,
      deletedKeys,
    });
  } catch (error) {
    console.error("[API /lectio-sources/invalidate] Cache invalidation error:", error);
    return NextResponse.json(
      { error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}
