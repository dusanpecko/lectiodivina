import { createClient } from "@/app/lib/supabase/server";
import { CACHE_PREFIX, CACHE_TTL, cacheQuery } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/lectio-sources
 * Fetch lectio sources with caching
 * Query params: date, lang, page, limit
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || "";
    const lang = searchParams.get("lang") || "sk";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Cache key includes all query params
    const cacheKey = `${CACHE_PREFIX.SOURCES}:date:${date}:lang:${lang}:page:${page}:limit:${limit}`;

    const result = await cacheQuery(
      cacheKey,
      async () => {
        const supabase = await createClient();
        
        // Build query
        let dataQuery = supabase
          .from("lectio_sources")
          .select("*");
        
        let countQuery = supabase
          .from("lectio_sources")
          .select("*", { count: "exact", head: true });

        // Date filter (most common use case)
        if (date) {
          dataQuery = dataQuery.eq("date", date);
          countQuery = countQuery.eq("date", date);
        }

        // Language filter
        if (lang) {
          dataQuery = dataQuery.eq("lang", lang);
          countQuery = countQuery.eq("lang", lang);
        }

        // Pagination
        dataQuery = dataQuery
          .order("date", { ascending: false })
          .order("reading_order", { ascending: true })
          .range((page - 1) * limit, page * limit - 1);

        // Execute queries in parallel
        const [{ data, error }, { count, error: countError }] = await Promise.all([
          dataQuery,
          countQuery,
        ]);

        if (error || countError) {
          throw new Error(error?.message || countError?.message || "Failed to fetch lectio sources");
        }

        return {
          data: data || [],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        };
      },
      CACHE_TTL.SEMI_STATIC // 15 minutes (lectio sources change once per day)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /lectio-sources] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
