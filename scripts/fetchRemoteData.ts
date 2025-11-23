import fs from "fs/promises";
import path from "path";
import * as cheerio from "cheerio";

const OUTPUT_DIR = path.join(process.cwd(), "data");
const TARGET_URL =
  "https://saras.cbse.gov.in/saras/AffiliatedList/ListOfSchdirReport";

export interface SchoolSummary {
  sno: number;
  affNo: string;
  state: string;
  district: string;
  status: string; // e.g. "Senior Secondary Level"
  schoolName: string;
  headName: string;
  address: string;
  website: string;
  detailsHref: string;
}

function buildRequestBody(schoolStatusWise: number): string {
  // NOTE: __RequestVerificationToken might expire; replace if needed.
  const token =
    "CfDJ8BiQfxQFoBlLliYICmUjWSTBLgUNrWt6dKCoXw6fIfrfApzXiZU_OW3BDTqWBeczt8avMmTvKUJHF07fwPbjOErd9u76VntbmavhapdApfpLwSO52q9ud3QITZybbFZRMJ1crBunkVZWlGUZS8N0UA4";

  const params = new URLSearchParams();
  params.append("MainRadioValue", "School_level_wise");
  params.append("State", "");
  params.append("Region", "");
  params.append("InstName_orAddress", "");
  params.append("RegiAffNo", "0");
  params.append("__Invariant", "RegiAffNo");
  params.append("SchoolStatusWise", String(schoolStatusWise));
  params.append("__RequestVerificationToken", token);

  return params.toString();
}

async function ensureOutputDir(): Promise<void> {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (err) {
    // rethrow for visibility
    throw err;
  }
}

function parseSchoolRow(
  $: cheerio.Root,
  row: cheerio.Element
): SchoolSummary | null {
  const tr = $(row);
  const tds = tr.find("td");
  if (!tds || tds.length < 6) return null;

  const getText = (i: number): string =>
    tr.find("td").eq(i).text().replace(/\s+/g, " ").trim();

  const snoRaw = getText(0);
  const sno = Number(snoRaw) || 0;
  const affNo = getText(1);

  const sdText = getText(2); // "State : TAMILNADU\nDistrict : CHENNAI"
  let state = "";
  let district = "";
  const sdMatch = sdText.match(
    /State\s*:\s*(.*?)\s*(?:District\s*:\s*(.*))?$/i
  );
  if (sdMatch) {
    state = (sdMatch[1] || "").trim();
    district = (sdMatch[2] || "").trim();
  }

  const status = getText(3);

  const shText = getText(4);
  let schoolName = "";
  let headName = "";
  const shMatch = shText.match(
    /Name\s*:\s*(.*?)\s*(?:Head\/Principal Name\s*:\s*(.*))?$/i
  );
  if (shMatch) {
    schoolName = (shMatch[1] || "").trim();
    headName = (shMatch[2] || "").trim();
  }

  const addrText = getText(5);
  let address = "";
  let website = "";
  const addrMatch = addrText.match(
    /Address\s*:\s*(.*?)\s*(?:Website\s*:\s*(.*))?$/i
  );
  if (addrMatch) {
    address = (addrMatch[1] || "").trim();
    website = (addrMatch[2] || "").trim();
  }

  let detailsHref = "";
  const linkEl = tr.find("td").eq(6).find("a");
  if (linkEl && linkEl.length > 0) {
    const href = linkEl.attr("href");
    detailsHref = href ? href : "";
  }

  return {
    sno,
    affNo,
    state,
    district,
    status,
    schoolName,
    headName,
    address,
    website,
    detailsHref,
  };
}

async function fetchForStatus(
  schoolStatusWise: number
): Promise<SchoolSummary[]> {
  const body = buildRequestBody(schoolStatusWise);

  const headers = {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-IN,en;q=0.9,kn;q=0.8,en-GB;q=0.7,ta;q=0.6",
    "cache-control": "max-age=0",
    "content-type": "application/x-www-form-urlencoded",
    priority: "u=0, i",
    "sec-ch-ua":
      '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    cookie:
      ".AspNetCore.Antiforgery.if8W-bTetZg=CfDJ8BiQfxQFoBlLliYICmUjWSRtpyuPQ8yqWdD7FszgX0ZqDJwixz6mp0Xjy0CJCfRQ_zat4eBYRIQ2jVpIG_N6UKqqwPfYt-Z0G4i5IuKKWtSwIARkcNI2g7JReNE1mu2u_RhiJJ6k_TAqhWYlAtgYNXQ; .AspNetCore.Session=CfDJ8BiQfxQFoBlLliYICmUjWSRrrAOET2JjhlsfSngVq5FypOCzYRJawNhe07H4OxX%2B1sJTxhbj5zAj2%2F07PqmN8zkZjzr%2B9TDr88Ueh2mO%2F%2FrypBgDSrXXMNemUYiHhYHFW%2FTD7CAj3mGV7C60Cuyc%2FlucrVD2G46JUvTdNX5yRsQF",
    Referer:
      "https://saras.cbse.gov.in/saras/AffiliatedList/ListOfSchdirReport",
  } as Record<string, string>;

  const res = await fetch(TARGET_URL, {
    method: "POST",
    headers,
    body,
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch status=${schoolStatusWise} : ${res.status} ${res.statusText}`
    );
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const rows: SchoolSummary[] = [];
  // try common table selectors
  const trs = $("table.table tbody tr, table.table tr, tbody tr").toArray();
  for (const trEl of trs) {
    const parsed = parseSchoolRow($, trEl);
    if (parsed) {
      // exclude placeholder rows
      if (
        parsed.schoolName === "--Select--" ||
        parsed.affNo === "0" ||
        parsed.schoolName === ""
      )
        continue;
      // Set human friendly status mapping if present as number
      parsed.status =
        schoolStatusWise === 1
          ? "Middle Class"
          : schoolStatusWise === 2
          ? "Secondary Level"
          : "Senior Secondary Level";
      rows.push(parsed);
    }
  }

  return rows;
}

async function saveDataForStatus(
  schoolStatusWise: number
): Promise<{ filename: string; count: number; last_grabbed: string }> {
  const data = await fetchForStatus(schoolStatusWise);
  const filename = path.join(
    OUTPUT_DIR,
    `schools_status_${schoolStatusWise}.json`
  );
  const last_grabbed = new Date().toISOString();
  const out = {
    meta: {
      status: schoolStatusWise,
      count: data.length,
      last_grabbed,
      source: TARGET_URL,
    },
    data,
  } as const;

  await fs.writeFile(filename, JSON.stringify(out, null, 2), "utf-8");
  return { filename, count: data.length, last_grabbed };
}

export async function main(): Promise<void> {
  await ensureOutputDir();
  const statuses = [1, 2, 3];
  for (const s of statuses) {
    console.log(`Fetching status ${s}...`);
    try {
      const result = await saveDataForStatus(s);
      console.log(
        `Saved ${result.filename} (${result.count} records) - last_grabbed=${result.last_grabbed}`
      );
    } catch (err) {
      console.error(`Error fetching status ${s}:`, err);
    }
  }
  console.log("Done.");
}

// ES module compatible CLI check: if script name appears in argv, run main()
const scriptPath = new URL(import.meta.url).pathname;
const isCli = process.argv.some(
  (a) =>
    a.endsWith("fetchRemoteData.ts") ||
    a.endsWith("fetchRemoteData.js") ||
    a === scriptPath
);
if (isCli) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
