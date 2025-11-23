import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/app/config";
import * as cheerio from "cheerio";

export interface SchoolDetail {
  nameOfInstitution: string;
  affiliationNumber: string;
  state: string;
  district: string;
  postalAddress: string;
  pinCode: string;
  website: string;
  yearOfFoundation: string;
  dateOfFirstOpening: string;
  principalName: string;
  gender: string;
  principalQualifications: string;
  noOfExperience: string;
  administrative: string;
  teaching: string;
  statusOfSchool: string;
  schoolType: string;
  affiliationPeriodFrom: string;
  affiliationPeriodTo: string;
  trustName: string;
  remarks: string;
}

const fetchSchoolDetail = async (affiliatedId: number) => {
  const res = await fetch(
    `${API_BASE_URL}/saras/AffiliatedList/AfflicationDetails/${affiliatedId}`,
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
      body: null,
      method: "GET",
    }
  );

  return res.text();
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ school: string }> }
) {
  const { school } = await context.params;

  // If stateId & districtId is provided, fetch the records
  if (school !== null) {
    const trimmed = school.trim();

    // Accept only non-empty numeric values (one or more digits)
    if (!/^[0-9]+$/.test(trimmed)) {
      return NextResponse.json(
        { error: "Invalid affiliate id. Must be a numeric value." },
        { status: 400 }
      );
    }

    const affiliatedId = Number(school.trim());

    try {
      const html = await fetchSchoolDetail(affiliatedId);

      const $ = cheerio.load(html);

      const detail: Partial<SchoolDetail> = {};

      // Each meaningful row has a label in the first <td> and the value in the second <td>
      const rows = $("table.table tr").toArray();
      for (const row of rows) {
        const tds = $(row).find("td");
        if (!tds || tds.length < 2) continue;

        const label = $(tds[0]).text().replace(/\s+/g, " ").trim();
        const value = $(tds[1]).text().replace(/\s+/g, " ").trim();

        const key = label.toLowerCase();

        if (key.includes("name of institution")) {
          detail.nameOfInstitution = value;
        } else if (key.includes("affiliation number")) {
          detail.affiliationNumber = value;
        } else if (key === "state") {
          detail.state = value;
        } else if (key === "district") {
          detail.district = value;
        } else if (key.includes("postal address")) {
          detail.postalAddress = value;
        } else if (key.includes("pin code")) {
          detail.pinCode = value;
        } else if (key.includes("website")) {
          detail.website = value;
        } else if (key.includes("year of foundation")) {
          detail.yearOfFoundation = value;
        } else if (key.includes("date of first opening")) {
          detail.dateOfFirstOpening = value;
        } else if (
          key.includes("name of principal") ||
          key.includes("name of principal/ head")
        ) {
          detail.principalName = value;
        } else if (key === "gender") {
          detail.gender = value;
        } else if (
          key.includes("principal's educational") ||
          key.includes("principal's educational/professional qualifications")
        ) {
          detail.principalQualifications = value;
        } else if (key.includes("no of experience")) {
          detail.noOfExperience = value;
        } else if (key.includes("administrative")) {
          detail.administrative = value;
        } else if (key.includes("teaching")) {
          detail.teaching = value;
        } else if (key.includes("status of the school")) {
          detail.statusOfSchool = value;
        } else if (key.includes("school type")) {
          detail.schoolType = value;
        } else if (key.includes("affiliation period")) {
          const m = value.match(/From\s*:\s*(.*?)\s*To\s*:\s*(.*)/i);
          if (m) {
            detail.affiliationPeriodFrom = m[1].trim();
            detail.affiliationPeriodTo = m[2].trim();
          } else {
            detail.affiliationPeriodFrom = value;
            detail.affiliationPeriodTo = "";
          }
        } else if (key.includes("name of trust")) {
          detail.trustName = value;
        } else if (key.includes("remarks")) {
          detail.remarks = value;
        }
      }

      const result: SchoolDetail = {
        nameOfInstitution: detail.nameOfInstitution || "",
        affiliationNumber: detail.affiliationNumber || "",
        state: detail.state || "",
        district: detail.district || "",
        postalAddress: detail.postalAddress || "",
        pinCode: detail.pinCode || "",
        website: detail.website || "",
        yearOfFoundation: detail.yearOfFoundation || "",
        dateOfFirstOpening: detail.dateOfFirstOpening || "",
        principalName: detail.principalName || "",
        gender: detail.gender || "",
        principalQualifications: detail.principalQualifications || "",
        noOfExperience: detail.noOfExperience || "",
        administrative: detail.administrative || "",
        teaching: detail.teaching || "",
        statusOfSchool: detail.statusOfSchool || "",
        schoolType: detail.schoolType || "",
        affiliationPeriodFrom: detail.affiliationPeriodFrom || "",
        affiliationPeriodTo: detail.affiliationPeriodTo || "",
        trustName: detail.trustName || "",
        remarks: detail.remarks || "",
      };

      return NextResponse.json(result);
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to fetch school details", details: String(err) },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ error: "No State API provided!" });
}
