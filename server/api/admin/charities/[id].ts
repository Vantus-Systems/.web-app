import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { defineEventHandler, readBody, createError } from "h3";
import { assertAnyPermission } from "~/server/utils/permissions";

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
  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing charity id" });
  }

  if (method === "GET") {
    assertAnyPermission(event.context.user?.role, ["charities:read"]);
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
    assertAnyPermission(event.context.user?.role, ["charities:edit"]);
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
      name: body.name || charities[idx].name,
      description: body.description ?? charities[idx].description,
      contact_person: body.contact_person || charities[idx].contact_person,
      tax_id: body.tax_id || charities[idx].tax_id,
      is_active: body.is_active ?? charities[idx].is_active,
    };

    await saveCharities(charities);

    return {
      success: true,
      data: charities[idx],
    };
  }

  if (method === "DELETE") {
    assertAnyPermission(event.context.user?.role, ["charities:edit"]);
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
