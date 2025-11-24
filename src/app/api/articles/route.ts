import { createClient } from "@/app/lib/supabase/server";
import { CACHE_PREFIX, CACHE_TTL, cacheQuery } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/articles
 * Fetch articles with caching
 * Query params: category, page, limit, search, author
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const author = searchParams.get("author") || "";

    // Cache key includes all query params
    const cacheKey = `${CACHE_PREFIX.ARTICLES}:cat:${category}:page:${page}:limit:${limit}:search:${search}:author:${author}`;

    const result = await cacheQuery(
      cacheKey,
      async () => {
        const supabase = await createClient();
        
        // Build query with joins
        let dataQuery = supabase
          .from("articles")
          .select(`
            *,
            article_categories (
              id,
              name,
              slug,
              color
            ),
            users!articles_author_id_fkey (
              id,
              full_name
            )
          `);
        
        let countQuery = supabase
          .from("articles")
          .select("*", { count: "exact", head: true });

        // Category filter
        if (category) {
          dataQuery = dataQuery.eq("category_id", category);
          countQuery = countQuery.eq("category_id", category);
        }

        // Author filter
        if (author) {
          dataQuery = dataQuery.eq("author_id", author);
          countQuery = countQuery.eq("author_id", author);
        }

        // Search filter
        if (search) {
          const searchPattern = `%${search}%`;
          dataQuery = dataQuery.or(
            `title.ilike.${searchPattern},excerpt.ilike.${searchPattern},content.ilike.${searchPattern}`
          );
          countQuery = countQuery.or(
            `title.ilike.${searchPattern},excerpt.ilike.${searchPattern},content.ilike.${searchPattern}`
          );
        }

        // Pagination
        dataQuery = dataQuery
          .order("created_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        // Execute queries in parallel
        const [{ data, error }, { count, error: countError }] = await Promise.all([
          dataQuery,
          countQuery,
        ]);

        if (error || countError) {
          throw new Error(error?.message || countError?.message || "Failed to fetch articles");
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
    console.error("[API /articles] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
