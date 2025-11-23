import { NextResponse } from "next/server";

const STATES = [
  { id: 25, name: "ANDAMAN and NICOBAR" },
  { id: 1, name: "ANDHRA PRADESH" },
  { id: 22, name: "ARUNACHAL PRADESH" },
  { id: 2, name: "ASSAM" },
  { id: 3, name: "BIHAR" },
  { id: 26, name: "CHANDIGARH" },
  { id: 33, name: "CHATTISGARH" },
  { id: 30, name: "DADAR and NAGAR HAVELI" },
  { id: 31, name: "DAMAN and DIU" },
  { id: 27, name: "DELHI" },
  { id: 50, name: "FOREIGN SCHOOLS" },
  { id: 28, name: "GOA" },
  { id: 4, name: "GUJARAT" },
  { id: 5, name: "HARYANA" },
  { id: 6, name: "HIMACHAL PRADESH" },
  { id: 7, name: "JAMMU and KASHMIR" },
  { id: 34, name: "JHARKHAND" },
  { id: 8, name: "KARNATAKA" },
  { id: 9, name: "KERALA" },
  { id: 37, name: "LADAKH" },
  { id: 32, name: "LAKSHADWEEP" },
  { id: 10, name: "MADHYA PRADESH" },
  { id: 11, name: "MAHARASHTRA" },
  { id: 12, name: "MANIPUR" },
  { id: 13, name: "MEGHALAYA" },
  { id: 23, name: "MIZORAM" },
  { id: 14, name: "NAGALAND" },
  { id: 15, name: "ODISHA" },
  { id: 29, name: "PUDUCHERRY" },
  { id: 16, name: "PUNJAB" },
  { id: 17, name: "RAJASTHAN" },
  { id: 18, name: "SIKKIM" },
  { id: 19, name: "TAMILNADU" },
  { id: 36, name: "TELANGANA" },
  { id: 20, name: "TRIPURA" },
  { id: 21, name: "UTTAR PRADESH" },
  { id: 35, name: "UTTARAKHAND" },
  { id: 24, name: "WEST BENGAL" },
];

function slug(s: string) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  // return list of available states and slugs
  const list = STATES.map((state) => ({
    id: state.id,
    name: state.name,
    slug: slug(state.name),
  }));
  return NextResponse.json({ states: list, total: list.length });
}
