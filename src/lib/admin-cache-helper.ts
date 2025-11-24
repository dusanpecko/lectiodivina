/**
 * Admin Cache Helper
 * 
 * Helper functions for invalidating cache from admin panels
 * after CREATE/UPDATE/DELETE operations
 */

/**
 * Invalidate cache by calling the invalidation endpoint
 * @param resource Resource name (news, articles, lectio-sources, categories, lectio)
 * @returns Number of invalidated keys
 */
export async function invalidateAdminCache(
  resource: "news" | "articles" | "lectio-sources" | "categories" | "lectio"
): Promise<number> {
  try {
    const response = await fetch(`/api/${resource}/invalidate`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to invalidate ${resource} cache`);
    }

    const data = await response.json();
    console.log(`[Admin Cache] ${data.message}`);
    
    return data.deletedKeys || 0;
  } catch (error) {
    console.error(`[Admin Cache] Failed to invalidate ${resource}:`, error);
    return 0;
  }
}

/**
 * Invalidate multiple caches at once
 * @param resources Array of resource names
 */
export async function invalidateMultipleCaches(
  resources: Array<"news" | "articles" | "lectio-sources" | "categories" | "lectio">
): Promise<void> {
  await Promise.all(resources.map((resource) => invalidateAdminCache(resource)));
}
