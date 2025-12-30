import { defineEventHandler, readBody } from "h3";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

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
  const id = getRouterParam(event, "id");

  if (method === "GET") {
    const charities = await loadCharities();
    const charity = charities.find((c) => c.id === id);

    if (!charity) {
      throw createError({
        statusCode: 404,
        statusMessage: "Charity not found",
      });
    }

    return {
      success: true,
      data: charity,
    };
  }

  if (method === "PUT") {
    const body = await readBody(event);
    const charities = await loadCharities();
    const idx = charities.findIndex((c) => c.id === id);

    if (idx < 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Charity not found",
      });
    }

    charities[idx] = {
      ...charities[idx],
      name: body.name,
      description: body.description || "",
      contact_person: body.contact_person,
      tax_id: body.tax_id,
      is_active: body.is_active ?? true,
    };

    await saveCharities(charities);

    return {
      success: true,
      data: charities[idx],
    };
  }

  if (method === "DELETE") {
    const charities = await loadCharities();
    const filtered = charities.filter((c) => c.id !== id);

    if (filtered.length === charities.length) {
      throw createError({
        statusCode: 404,
        statusMessage: "Charity not found",
      });
    }

    await saveCharities(filtered);

    return {
      success: true,
      message: "Charity deleted",
    };
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed",
  });
});
