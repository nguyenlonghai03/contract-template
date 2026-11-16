import { API_BASE_URL } from "@/lib/config";

// Lỗi HTTP có kèm status để nơi gọi phân biệt 404 (notFound) với lỗi hệ thống.
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | undefined | null;

type ApiGetOptions = {
  params?: Record<string, QueryValue>;
  // Số giây giữ trong Next.js Data Cache; false = cache vô thời hạn, 0 = không cache.
  revalidate?: number | false;
  tags?: string[];
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 10_000;

// GET JSON từ backend bằng fetch gốc (thay cho axios ở phía Server Component)
// để tận dụng Data Cache + request memoization của Next.js. Axios không đi qua
// fetch nên trước đây mọi lần render đều gọi thẳng backend.
export async function apiGet<T>(
  path: string,
  { params, revalidate, tags, timeoutMs = DEFAULT_TIMEOUT_MS }: ApiGetOptions = {},
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
    next: {
      ...(revalidate !== undefined ? { revalidate } : {}),
      ...(tags?.length ? { tags } : {}),
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `GET ${url.pathname} failed: ${res.status}`);
  }

  return (await res.json()) as T;
}
