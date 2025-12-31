import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { defineEventHandler, readBody } from "h3";

const dataDir = join(process.cwd(), "server/data");

interface Charity {
  id: string;
  name: string;
  description: string;
  contact_person: string;
  tax_id: string;
  is_active: boolean;
  createdAt: string;
}

async function loadCharities(): Promise<Charity[]> {
  try {
    const content = await readFile(join(dataDir, "charities.json"), "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveCharities(charities: Charity[]): Promise<void> {
  await writeFile(
    join(dataDir, "charities.json"),
    JSON.stringify(charities, null, 2),
  );
}

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === "GET") {
    const charities = await loadCharities();
    return {
      success: true,
      data: charities,
    };
  }

  if (method === "POST") {
    const body = await readBody(event);
    const charities = await loadCharities();

    const newCharity: Charity = {
      id: `charity-${Date.now()}`,
      name: body.name,
      description: body.description || "",
      contact_person: body.contact_person,
      tax_id: body.tax_id,
      is_active: body.is_active ?? true,
      createdAt: new Date().toISOString(),
    };

    charities.push(newCharity);
    await saveCharities(charities);

    return {
      success: true,
      data: newCharity,
    };
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed",
  });
});
