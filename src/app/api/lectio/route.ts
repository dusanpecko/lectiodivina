import { createClient } from "@/app/lib/supabase/server";
import { CACHE_PREFIX, CACHE_TTL, cacheQuery } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

interface LiturgicalCalendarDay {
  id: number;
  datum: string;
  locale_code: string;
  celebration_title: string;
  celebration_rank_num: number | null;
  lectio_hlava: string | null;
  liturgical_year_id: number;
}

interface LiturgicalYear {
  id: number;
  year: string;
  start_date: string;
  end_date: string;
  lectionary_cycle: string;
}

/**
 * GET /api/lectio
 * Fetch lectio divina data with caching
 * Query params: date (YYYY-MM-DD), lang (sk/cz/en/es)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const lang = searchParams.get("lang") || "sk";

    if (!dateParam) {
      return NextResponse.json(
        { error: "Missing required parameter: date" },
        { status: 400 }
      );
    }

    // Cache key includes date and language
    const cacheKey = `${CACHE_PREFIX.LECTIO}:date:${dateParam}:lang:${lang}`;

    const result = await cacheQuery(
      cacheKey,
      async () => {
        const supabase = await createClient();

        // 1. Find calendar day for given date and language
        const { data: calendarDay, error: calendarError } = await supabase
          .from("liturgical_calendar")
          .select("*")
          .eq("datum", dateParam)
          .eq("locale_code", lang)
          .single();

        if (calendarError) {
          // Fallback to Slovak if current language not found
          if (lang !== "sk") {
            const { data: skCalendarDay, error: skCalendarError } = await supabase
              .from("liturgical_calendar")
              .select("*")
              .eq("datum", dateParam)
              .eq("locale_code", "sk")
              .single();

            if (skCalendarError || !skCalendarDay) {
              throw new Error("Calendar day not found for any language");
            }

            return await loadLectioFromCalendar(supabase, skCalendarDay, "sk");
          }

          throw new Error("Calendar day not found");
        }

        return await loadLectioFromCalendar(supabase, calendarDay, lang);
      },
      CACHE_TTL.SEMI_STATIC // 15 minutes - lectio changes daily but not frequently
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /lectio] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to load lectio from calendar day
async function loadLectioFromCalendar(
  supabase: Awaited<ReturnType<typeof createClient>>,
  calendarDay: LiturgicalCalendarDay,
  currentLang: string
) {
  if (!calendarDay.lectio_hlava) {
    return {
      lectioData: null,
      celebrationTitle: null,
      error: "Calendar day has no assigned lectio_hlava",
    };
  }

  // Get liturgical year
  const { data: liturgicalYear, error: yearError } = await supabase
    .from("liturgical_years")
    .select("*")
    .eq("id", calendarDay.liturgical_year_id)
    .single() as { data: LiturgicalYear | null; error: Error | null };

  if (yearError || !liturgicalYear) {
    return {
      lectioData: null,
      celebrationTitle: null,
      error: "Liturgical year not found",
    };
  }

  // Determine if we should use cycle (A/B/C) or 'N' for weekdays
  const isWeekday = calendarDay.celebration_title?.match(
    /(Pondelok|Utorok|Streda|Štvrtok|Piatok|Sobota).+týždňa v Cezročnom období/
  );
  const isSpecialDay =
    !isWeekday &&
    (calendarDay.celebration_title?.includes("nedeľa") ||
      calendarDay.celebration_title?.includes("Nedeľa") ||
      calendarDay.celebration_title?.includes("Sunday") ||
      (calendarDay.celebration_rank_num !== null &&
        calendarDay.celebration_rank_num > 1));

  const rokToSearch = isSpecialDay ? liturgicalYear.lectionary_cycle : "N";

  // Find lectio source
  const { data: lectioSource, error: lectioError } = await supabase
    .from("lectio_sources")
    .select("*")
    .eq("hlava", calendarDay.lectio_hlava)
    .eq("lang", currentLang)
    .eq("rok", rokToSearch)
    .single();

  if (lectioError) {
    // For special days: try 'N' if A/B/C not found
    if (isSpecialDay && rokToSearch !== "N") {
      const { data: fallbackSource, error: fallbackError } = await supabase
        .from("lectio_sources")
        .select("*")
        .eq("hlava", calendarDay.lectio_hlava)
        .eq("lang", currentLang)
        .eq("rok", "N")
        .single();

      if (!fallbackError && fallbackSource) {
        return {
          lectioData: fallbackSource,
          celebrationTitle: calendarDay.celebration_title,
        };
      }
    }

    // Fallback to Slovak if current language is not SK
    if (currentLang !== "sk") {
      const { data: skLectioSource, error: skLectioError } = await supabase
        .from("lectio_sources")
        .select("*")
        .eq("hlava", calendarDay.lectio_hlava)
        .eq("lang", "sk")
        .eq("rok", rokToSearch)
        .single();

      if (!skLectioError && skLectioSource) {
        return {
          lectioData: skLectioSource,
          celebrationTitle: calendarDay.celebration_title,
        };
      }

      // For special days in Slovak: also try 'N'
      if (isSpecialDay && rokToSearch !== "N") {
        const { data: skFallbackSource, error: skFallbackError } =
          await supabase
            .from("lectio_sources")
            .select("*")
            .eq("hlava", calendarDay.lectio_hlava)
            .eq("lang", "sk")
            .eq("rok", "N")
            .single();

        if (!skFallbackError && skFallbackSource) {
          return {
            lectioData: skFallbackSource,
            celebrationTitle: calendarDay.celebration_title,
          };
        }
      }
    }

    return {
      lectioData: null,
      celebrationTitle: null,
      error: "Lectio source not found for any language",
    };
  }

  return {
    lectioData: lectioSource,
    celebrationTitle: calendarDay.celebration_title,
  };
}
