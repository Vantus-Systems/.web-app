import { defineEventHandler } from "h3";
import { readFileSync } from "fs";
import { resolve } from "path";

// Reuse the admin source of truth
const CHARITIES_PATH = resolve("server/data/charities.json");

interface Charity {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  impact?: string;
  is_active: boolean;
  // Private fields to exclude: tax_id, contact_person, etc.
}

export default defineEventHandler(async () => {
  try {
    const fileContent = readFileSync(CHARITIES_PATH, "utf-8");
    const charities: Charity[] = JSON.parse(fileContent);

    // Filter and map to public safe format
    return charities
      .filter((c) => c.is_active)
      .map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        logo: c.logo || null,
        website: c.website || null,
        impact: c.impact || null,
      }));
  } catch (error) {
    console.error("Failed to read charities", error);
    return [];
  }
});
