import { createClient } from "@/app/lib/supabase/server";
import { CACHE_PREFIX, CACHE_TTL, cacheQuery } from "@/lib/cache";
import { NextResponse } from "next/server";

/**
 * GET /api/categories
 * Fetch article categories with caching
 * Categories rarely change, so we use STATIC cache (1 hour)
 */
export async function GET() {
  try {
    const cacheKey = `${CACHE_PREFIX.CATEGORIES}:all`;

    const result = await cacheQuery(
      cacheKey,
      async () => {
        const supabase = await createClient();
        
        const { data, error } = await supabase
          .from("article_categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        return {
          data: data || [],
          total: data?.length || 0,
        };
      },
      CACHE_TTL.STATIC // 1 hour (categories rarely change)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /categories] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
