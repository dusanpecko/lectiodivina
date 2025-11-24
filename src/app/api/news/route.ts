import { createClient } from "@/app/lib/supabase/server";
import { CACHE_PREFIX, CACHE_TTL, cacheQuery } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/news
 * Fetch news with caching
 * Query params: lang, page, limit, search, title, summary, content, dateFrom, dateTo
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "sk";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const title = searchParams.get("title") || "";
    const summary = searchParams.get("summary") || "";
    const content = searchParams.get("content") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    // Cache key includes all query params
    const cacheKey = `${CACHE_PREFIX.NEWS}:lang:${lang}:page:${page}:limit:${limit}:search:${search}:title:${title}:summary:${summary}:content:${content}:from:${dateFrom}:to:${dateTo}`;

    const result = await cacheQuery(
      cacheKey,
      async () => {
        const supabase = await createClient();
        
        // Build query
        let dataQuery = supabase
          .from("news")
          .select("*")
          .eq("lang", lang);
        
        let countQuery = supabase
          .from("news")
          .select("*", { count: "exact", head: true })
          .eq("lang", lang);

        // Global search filter (searches across multiple fields)
        if (search) {
          const searchPattern = `%${search}%`;
          dataQuery = dataQuery.or(
            `title.ilike.${searchPattern},summary.ilike.${searchPattern},content.ilike.${searchPattern}`
          );
          countQuery = countQuery.or(
            `title.ilike.${searchPattern},summary.ilike.${searchPattern},content.ilike.${searchPattern}`
          );
        } else {
          // Individual field filters (only when no global search)
          if (title) {
            dataQuery = dataQuery.ilike("title", `%${title}%`);
            countQuery = countQuery.ilike("title", `%${title}%`);
          }
          if (summary) {
            dataQuery = dataQuery.ilike("summary", `%${summary}%`);
            countQuery = countQuery.ilike("summary", `%${summary}%`);
          }
          if (content) {
            dataQuery = dataQuery.ilike("content", `%${content}%`);
            countQuery = countQuery.ilike("content", `%${content}%`);
          }
          if (dateFrom) {
            dataQuery = dataQuery.gte("published_at", dateFrom);
            countQuery = countQuery.gte("published_at", dateFrom);
          }
          if (dateTo) {
            dataQuery = dataQuery.lte("published_at", dateTo);
            countQuery = countQuery.lte("published_at", dateTo);
          }
        }

        // Pagination
        dataQuery = dataQuery
          .order("published_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        // Execute queries in parallel
        const [{ data, error }, { count, error: countError }] = await Promise.all([
          dataQuery,
          countQuery,
        ]);

        if (error || countError) {
          throw new Error(error?.message || countError?.message || "Failed to fetch news");
        }

        return {
          data: data || [],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        };
      },
      CACHE_TTL.DYNAMIC // 5 minutes
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /news] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
