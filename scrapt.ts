import { runScraper } from "./src/lib/scraper/motolux-scraper";
import { db } from "./src/lib/db";

async function main() {
  console.log("Starting full MOTOLUX scrape...");
  const result = await runScraper({ maxProducts: 0, delayMs: 800 });
  console.log("\n=== FINAL REPORT ===");
  console.log("Scraped:", result.totalScraped);
  console.log("Saved:", result.totalSaved);
  console.log("Duplicates:", result.totalDuplicates);
  console.log("Errors:", result.totalErrors);
  console.log("Categories:", result.categories);
  if (result.errors.length > 0) {
    console.log("Error details:", result.errors.slice(0, 5));
  }
  const dbCount = await db.importedProduct.count();
  const cats = await db.importedProduct.findMany({ select: { category: true }, distinct: ["category"] });
  console.log("DB Total:", dbCount, "| Categories:", cats.length);
}
main().catch(e => console.error("Fatal:", e.message));
