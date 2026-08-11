import { describe, it, expect } from "vitest";
import {
  buildRegisterCsv,
  escapeCsvValue,
  registerFileName,
  slugify,
} from "@/components/admin/eventCsv";

describe("event register CSV", () => {
  it("writes a header row and one row per booking", () => {
    const csv = buildRegisterCsv([
      { name: "Ada Lovelace", email: "ada@example.com", participants: 2 },
      { name: "Alan Turing", email: "alan@example.com", participants: 1 },
    ]);
    expect(csv.split("\r\n")).toEqual([
      "name,email,participants",
      "Ada Lovelace,ada@example.com,2",
      "Alan Turing,alan@example.com,1",
    ]);
  });

  it("quotes values containing commas, quotes or newlines", () => {
    expect(escapeCsvValue("Smith, John")).toBe('"Smith, John"');
    expect(escapeCsvValue('He said "hi"')).toBe('"He said ""hi"""');
    expect(escapeCsvValue("line1\nline2")).toBe('"line1\nline2"');
    expect(escapeCsvValue("plain")).toBe("plain");
    expect(escapeCsvValue(null)).toBe("");
  });

  it("slugifies event titles for the filename", () => {
    expect(slugify("Full Moon Summit!")).toBe("full-moon-summit");
    expect(slugify("!!!")).toBe("event");
    expect(registerFileName("Sunrise Hike", "2026-08-14")).toBe(
      "summitfit-sunrise-hike-2026-08-14.csv"
    );
  });
});
