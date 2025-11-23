import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/app/config";

const fetchDistricts = async (stateId: number) => {
  const res = await fetch(
    `${API_BASE_URL}/saras/PartASec/Dist_Bind?state_id=${stateId}`,
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-IN,en;q=0.9,kn;q=0.8,en-GB;q=0.7,ta;q=0.6",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        cookie:
          ".AspNetCore.Antiforgery.if8W-bTetZg=CfDJ8BiQfxQFoBlLliYICmUjWSRtpyuPQ8yqWdD7FszgX0ZqDJwixz6mp0Xjy0CJCfRQ_zat4eBYRIQ2jVpIG_N6UKqqwPfYt-Z0G4i5IuKKWtSwIARkcNI2g7JReNE1mu2u_RhiJJ6k_TAqhWYlAtgYNXQ; .AspNetCore.Session=CfDJ8BiQfxQFoBlLliYICmUjWSRrrAOET2JjhlsfSngVq5FypOCzYRJawNhe07H4OxX%2B1sJTxhbj5zAj2%2F07PqmN8zkZjzr%2B9TDr88Ueh2mO%2F%2FrypBgDSrXXMNemUYiHhYHFW%2FTD7CAj3mGV7C60Cuyc%2FlucrVD2G46JUvTdNX5yRsQF",
        Referer: `${API_BASE_URL}/saras/AffiliatedList/ListOfSchdirReport`,
      },
      body: null,
      method: "GET",
    }
  );

  return res.json();
};

interface District {
  disabled: boolean;
  group?: string;
  selected: boolean;
  text: string;
  value: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ state: string }> }
) {
  const { state } = await context.params;

  // If stateId is provided, validate and return districts
  if (state !== null) {
    const trimmed = state.trim();

    // Accept only non-empty numeric values (one or more digits)
    if (!/^[0-9]+$/.test(trimmed)) {
      return NextResponse.json(
        { error: "Invalid stateId. Must be a numeric value." },
        { status: 400 }
      );
    }

    const stateId = Number(trimmed);
    try {
      const data = await fetchDistricts(stateId);
      const refinedData = Array.isArray(data)
        ? data
            .filter((district: District) => {
              const text = (district?.text ?? "").trim();
              const value = (district?.value ?? "").trim();
              // exclude placeholder and empty entries
              if (!text || !value) return false;
              if (text === "--Select--" || value === "0") return false;
              return true;
            })
            .map((district: District) => ({
              text: district.text,
              value: district.value,
            }))
        : [];
      return NextResponse.json({
        districts: refinedData,
        total: refinedData.length,
      });
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to fetch districts", details: String(err) },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ error: "No State API provided!" });
}
