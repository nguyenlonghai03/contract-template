import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doShardedTagCache from "@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// Mặc định OpenNext dùng cache "dummy": ISR / Data Cache / revalidate KHÔNG
// hoạt động và mọi request SSR đều gọi thẳng backend. Cấu hình thật:
// - incrementalCache: lưu trang ISR + fetch cache vào R2 (NEXT_INC_CACHE_R2_BUCKET)
// - tagCache: Durable Object cho revalidateTag (/api/revalidate do backend gọi)
// - queue: Durable Object xử lý revalidate nền (stale-while-revalidate)
// Binding tương ứng khai báo trong wrangler.toml.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: doShardedTagCache({ baseShardSize: 2 }),
  queue: doQueue,
});
