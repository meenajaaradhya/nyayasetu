interface NewsArticle {
  url: string;
  title: string;
  source: string;
  indexedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseIndexedDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value);
  if (!match) return undefined;
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function getArticles(payload: unknown): NewsArticle[] {
  if (!isRecord(payload) || !Array.isArray(payload.articles)) {
    throw new Error("News provider returned an unexpected response");
  }

  const articles: NewsArticle[] = [];
  for (const candidate of payload.articles) {
    if (!isRecord(candidate)) continue;
    if (typeof candidate.title !== "string" || !candidate.title.trim()
      || typeof candidate.url !== "string" || candidate.language !== "English"
      || candidate.sourcecountry !== "India") continue;

    let url: URL;
    try {
      url = new URL(candidate.url);
    } catch {
      continue;
    }
    if (url.protocol !== "https:") continue;
    const indexedAt = parseIndexedDate(candidate.seendate);
    if (!indexedAt) continue;

    articles.push({
      url: url.href,
      title: candidate.title.trim().slice(0, 400),
      source: url.hostname.replace(/^www\./, ""),
      indexedAt,
    });
    if (articles.length === 12) break;
  }
  return articles;
}

function jsonResponse(body: Record<string, unknown>, status: number, cacheControl = "no-store"): Response {
  const headers: Record<string, string> = {
    "Cache-Control": cacheControl === "no-store" ? "no-store" : "public, max-age=300",
    "Content-Type": "application/json; charset=utf-8",
  };
  if (cacheControl !== "no-store") {
    headers["Netlify-CDN-Cache-Control"] = cacheControl;
  }
  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const feedUrl = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  feedUrl.searchParams.set("query", "India (law OR legal OR court OR amendment OR bill)");
  feedUrl.searchParams.set("mode", "ArtList");
  feedUrl.searchParams.set("format", "json");
  feedUrl.searchParams.set("maxrecords", "30");
  feedUrl.searchParams.set("timespan", "7d");
  feedUrl.searchParams.set("sort", "DateDesc");

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(feedUrl, { signal: AbortSignal.timeout(12_000) });
  } catch (error) {
    console.error("Could not reach the legal news provider.", error);
    return jsonResponse({ error: "News provider is unavailable" }, 502);
  }
  if (!upstreamResponse.ok) {
    console.error(`Legal news provider returned HTTP ${upstreamResponse.status}`);
    return jsonResponse({ error: "News provider returned an error" }, 502);
  }

  let payload: unknown;
  try {
    payload = await upstreamResponse.json();
  } catch (error) {
    console.error("Could not parse legal news provider response.", error);
    return jsonResponse({ error: "News provider returned invalid data" }, 502);
  }

  let articles: NewsArticle[];
  try {
    articles = getArticles(payload);
  } catch (error) {
    console.error("Legal news provider response was invalid.", error);
    return jsonResponse({ error: "News provider returned invalid data" }, 502);
  }

  return jsonResponse(
    { articles },
    200,
    "public, max-age=0, s-maxage=900, stale-while-revalidate=3600",
  );
}
