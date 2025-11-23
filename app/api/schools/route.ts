import fs from "fs/promises";
import path from "path";

type SchoolSummary = {
  sno: number;
  affNo: string;
  state: string;
  district: string;
  status: string;
  schoolName: string;
  headName: string;
  address: string;
  website: string;
  detailsHref: string;
};

type SchoolsFile = {
  meta?: Record<string, unknown>;
  data?: SchoolSummary[];
};

const DATA_FILE = path.join(process.cwd(), "data", "schools.json");

function normalize(v?: string | null) {
  return (v || "").toString().trim().toLowerCase();
}

function mapStatusNumberToName(n: string) {
  if (!n) return "";
  const v = n.trim();
  if (v === "1") return "Middle Class";
  if (v === "2") return "Secondary Level";
  if (v === "3") return "Senior Secondary Level";
  return v;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams;
    const stateQ = normalize(q.get("state"));
    const districtQ = normalize(q.get("district"));
    const statusQRaw = q.get("status");
    const statusQ = normalize(mapStatusNumberToName(statusQRaw || ""));

    // read data file
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as SchoolsFile;
    const arr = parsed.data || [];

    // apply filters
    const filtered = arr.filter((it) => {
      if (stateQ) {
        if (!normalize(it.state).includes(stateQ)) return false;
      }
      if (districtQ) {
        if (!normalize(it.district).includes(districtQ)) return false;
      }
      if (statusQ) {
        if (!normalize(it.status).includes(statusQ)) return false;
      }
      return true;
    });

    const meta = {
      requested_filters: {
        state: q.get("state") || null,
        district: q.get("district") || null,
        status: q.get("status") || null,
      },
      source_total: parsed.meta?.total_unique ?? arr.length,
      source_meta: parsed.meta ?? null,
      filtered_count: filtered.length,
      returned_at: new Date().toISOString(),
    };

    const body = JSON.stringify({ meta, data: filtered });
    return new Response(body, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const body = JSON.stringify({ error: message });
    return new Response(body, {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
