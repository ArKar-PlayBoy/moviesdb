import { syncAllMatches } from "../lib/sync-matches";
import { persistToFile, clearMemoryStore } from "../lib/storage";

async function main() {
  console.log(`[sync] Starting match sync at ${new Date().toISOString()}...`);

  clearMemoryStore();

  const stats = await syncAllMatches();

  persistToFile();

  console.log(
    `[sync] Done. Total: ${stats.total} | Live: ${stats.live} | Finished: ${stats.finished} | Scheduled: ${stats.scheduled} | Persisted: ${stats.persisted}`,
  );
  if (stats.changedIds.length > 0) {
    console.log(`[sync] Changed matches: ${stats.changedIds.join(", ")}`);
  }
}

main().catch((err) => {
  console.error("[sync] Fatal error:", err);
  process.exit(1);
});
