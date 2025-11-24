import { invalidateResource } from "@/lib/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/categories/invalidate
 * Invalidate categories cache
 */
export async function POST() {
  try {
    const deletedKeys = await invalidateResource("CATEGORIES");
    
    return NextResponse.json({
      success: true,
      message: `Invalidated ${deletedKeys} cache keys`,
      deletedKeys,
    });
  } catch (error) {
    console.error("[API /categories/invalidate] Cache invalidation error:", error);
    return NextResponse.json(
      { error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}
