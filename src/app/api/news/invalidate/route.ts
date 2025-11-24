import { invalidateResource } from "@/lib/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/news/invalidate
 * Invalidate news cache (call after CREATE/UPDATE/DELETE)
 */
export async function POST() {
  try {
    const deletedKeys = await invalidateResource("NEWS");
    
    return NextResponse.json({
      success: true,
      message: `Invalidated ${deletedKeys} cache keys`,
      deletedKeys,
    });
  } catch (error) {
    console.error("[API /news/invalidate] Cache invalidation error:", error);
    return NextResponse.json(
      { error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}
