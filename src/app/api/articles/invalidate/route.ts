import { invalidateResource } from "@/lib/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/articles/invalidate
 * Invalidate articles cache
 */
export async function POST() {
  try {
    const deletedKeys = await invalidateResource("ARTICLES");
    
    return NextResponse.json({
      success: true,
      message: `Invalidated ${deletedKeys} cache keys`,
      deletedKeys,
    });
  } catch (error) {
    console.error("[API /articles/invalidate] Cache invalidation error:", error);
    return NextResponse.json(
      { error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}
