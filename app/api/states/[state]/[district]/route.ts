import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/app/config";
import * as cheerio from "cheerio";

interface School {
  sno: string;
  affNo: string;
  state: string;
  district: string;
  status: string;
  schoolName: string;
  headName: string;
  address: string;
  website: string;
  detailsHref: string;
}

const fetchSchools = async (state: number, district: number) => {
  const res = await fetch(
    `${API_BASE_URL}/saras/AffiliatedList/ListOfSchdirReport`,
    {
      headers: {
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
      },
      body: `MainRadioValue=State_wise&State=${state}&District=${district}&Region=&InstName_orAddress=&RegiAffNo=2025&__Invariant=RegiAffNo&SchoolStatusWise=1&__RequestVerificationToken=CfDJ8BiQfxQFoBlLliYICmUjWSRws_fGOXjGhxZVNaoP1d8AhbWt2UvtBDNHjMJe5dGdFJm66U3GIUPY8NESa_ilS8wIzuoOffkykvbwRivvXJH0xDXNBBkpAEuPqRhcB1GfK0cZRh1LVXI3Hg8z3TJ93Bw`,
      method: "POST",
    }
  );

  return res.text();
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ state: string; district: string }> }
) {
  const { state, district } = await context.params;

  // If stateId & districtId is provided, fetch the records
  if (state !== null && district !== null) {
    const trimmed = state.trim();

    // Accept only non-empty numeric values (one or more digits)
    if (!/^[0-9]+$/.test(trimmed)) {
      return NextResponse.json(
        { error: "Invalid state/district id. Must be a numeric value." },
        { status: 400 }
      );
    }

    const stateId = Number(state);

    const districtId = Number(district.trim());

    try {
      const html = await fetchSchools(stateId, districtId);

      const $ = cheerio.load(html);

      const rows: School[] = [];
      // select table body rows; try common selectors
      const trs = $(
        "table#myTable tbody tr, table.table tbody tr, tbody tr"
      ).toArray();
      trs.forEach((tr) => {
        const tds = $(tr).find("td");
        if (!tds || tds.length === 0) return;

        const getText = (i: number) =>
          $(tds[i]).text().replace(/\s+/g, " ").trim();

        const sno = getText(0);
        const affNo = getText(1);

        // State & District cell parsing
        const sdText = getText(2); // e.g. "State : TAMILNADU District : CHENNAI"
        let stateName = "";
        let districtName = "";
        const sdMatch = sdText.match(
          /State\s*:\s*(.*?)\s*(?:District\s*:\s*(.*))?$/i
        );
        if (sdMatch) {
          stateName = (sdMatch[1] || "").trim();
          districtName = (sdMatch[2] || "").trim();
        }

        const status = getText(3);

        // School & Head Name cell
        const shText = getText(4); // e.g. "Name : KENDRIYA VIDYALAYA Head/Principal Name: R N..."
        let schoolName = "";
        let headName = "";
        const shMatch = shText.match(
          /Name\s*:\s*(.*?)\s*(?:Head\/Principal Name\s*:\s*(.*))?$/i
        );
        if (shMatch) {
          schoolName = (shMatch[1] || "").trim();
          headName = (shMatch[2] || "").trim();
        }

        // Address & Website
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

        // Details link
        let detailsHref = $(tds[6]).find("a").attr("href") || "";
        if (detailsHref && !detailsHref.startsWith("http")) {
          // make absolute using API base origin if possible
          try {
            const base = new URL(API_BASE_URL);
            detailsHref = new URL(detailsHref, base.origin).toString();
          } catch {
            // leave as-is
          }
        }

        rows.push({
          sno,
          affNo,
          state: stateName,
          district: districtName,
          status,
          schoolName,
          headName,
          address,
          website,
          detailsHref,
        });
      });

      return NextResponse.json({ schools: rows, total: rows.length });
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to fetch districts", details: String(err) },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ error: "No State API provided!" });
}
