import fs from "fs/promises";
import path from "path";
import type { SchoolSummary } from "./fetchRemoteData";

const OUTPUT_DIR = path.join(process.cwd(), "data");

type StatusFile = {
  meta?: {
    status?: number;
    count?: number;
    last_grabbed?: string;
    source?: string;
  };
  data?: SchoolSummary[];
};

async function readStatusFile(status: number): Promise<{
  items: SchoolSummary[];
  meta: StatusFile["meta"];
}> {
  const filename = path.join(OUTPUT_DIR, `schools_status_${status}.json`);
  const raw = await fs.readFile(filename, "utf-8");
  const parsed = JSON.parse(raw) as StatusFile;
  return { items: parsed.data || [], meta: parsed.meta || {} };
}

async function main(): Promise<void> {
  const statuses = [1, 2, 3];
  const map = new Map<string, SchoolSummary>();
  const statusesInfo: Array<{
    status: number;
    count: number;
    last_grabbed?: string;
  }> = [];

  for (const s of statuses) {
    try {
      const { items, meta } = await readStatusFile(s);
      statusesInfo.push({
        status: s,
        count: items.length,
        last_grabbed: meta?.last_grabbed,
      });
      for (const item of items) {
        if (!map.has(item.affNo)) {
          map.set(item.affNo, item);
        }
      }
    } catch (err) {
      console.warn(`Warning: could not read data for status ${s}: ${err}`);
    }
  }

  const merged = Array.from(map.values());
  const out = {
    meta: {
      statuses: statusesInfo,
      total_unique: merged.length,
      merged_at: new Date().toISOString(),
    },
    data: merged,
  };

  const outFile = path.join(OUTPUT_DIR, "schools.json");
  await fs.writeFile(outFile, JSON.stringify(out, null, 2), "utf-8");
  console.log(`Merged ${merged.length} unique records to ${outFile}`);
}

// ES module compatible CLI check
const mergeScriptPath = new URL(import.meta.url).pathname;
const isMergeCli = process.argv.some(
  (a) =>
    a.endsWith("mergeSchoolWiseData.ts") ||
    a.endsWith("mergeSchoolWiseData.js") ||
    a === mergeScriptPath
);
if (isMergeCli) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
