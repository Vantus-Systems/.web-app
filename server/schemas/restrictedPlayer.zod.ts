import { z } from "zod";

/**
 * Restricted player search (for check verification)
 */
export const restrictedPlayerSearchSchema = z.object({
  query: z.string().min(1, "Search query required"),
});

export type RestrictedPlayerSearchInput = z.infer<
  typeof restrictedPlayerSearchSchema
>;

/**
 * Restricted player create/update
 */
export const restrictedPlayerCreateSchema = z.object({
  name: z.string().min(1, "Name required"),
  notes: z.string().optional(),
  active: z.boolean().default(true),
});

export type RestrictedPlayerCreateInput = z.infer<
  typeof restrictedPlayerCreateSchema
>;

/**
 * Restricted player update
 */
export const restrictedPlayerUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  notes: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export type RestrictedPlayerUpdateInput = z.infer<
  typeof restrictedPlayerUpdateSchema
>;

/**
 * Restricted player response
 */
export const restrictedPlayerResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  notes: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type RestrictedPlayerResponse = z.infer<
  typeof restrictedPlayerResponseSchema
>;
