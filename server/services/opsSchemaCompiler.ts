import { opsSchemaV2Schema } from "@server/schemas/ops-schema.zod";
import type { OpsSchemaV2 } from "~/types/ops-schema";

type CompilerOptions = {
  previousPricing?: unknown;
  previousSchedule?: unknown;
};

export const compileOpsSchema = (
  schema: OpsSchemaV2,
  options: CompilerOptions = {},
) => {
  opsSchemaV2Schema.parse(schema);

  return {
    pricing: options.previousPricing ?? {},
    schedule: options.previousSchedule ?? {},
  };
};
