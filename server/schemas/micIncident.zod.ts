import { z } from "zod";

export const incidentTypeSchema = z.enum([
  "Maintenance",
  "PlayerIssue",
  "Supply",
  "Money",
  "Other",
]);

export type IncidentType = z.infer<typeof incidentTypeSchema>;

export const incidentStatusSchema = z.enum(["OPEN", "RESOLVED"]);

export type IncidentStatus = z.infer<typeof incidentStatusSchema>;

/**
 * Incident creation input
 */
export const incidentCreateSchema = z.object({
  shift_id: z.string().optional().nullable(), // can exist without a shift
  type: incidentTypeSchema,
  description: z.string().min(1, "Description required"),
});

export type IncidentCreateInput = z.infer<typeof incidentCreateSchema>;

/**
 * Incident update input (e.g., to resolve)
 */
export const incidentUpdateSchema = z.object({
  status: incidentStatusSchema.optional(),
  description: z.string().min(1).optional(),
  resolved_at: z.string().optional().nullable(),
});

export type IncidentUpdateInput = z.infer<typeof incidentUpdateSchema>;

/**
 * Incident response
 */
export const incidentResponseSchema = z.object({
  id: z.string(),
  shift_id: z.string().optional().nullable(),
  reported_by_user_id: z.string().optional().nullable(),
  type: z.string(),
  description: z.string(),
  status: z.string(),
  created_at: z.string(),
  resolved_at: z.string().optional().nullable(),
  reported_by: z
    .object({
      id: z.string(),
      username: z.string(),
      first_name: z.string().optional().nullable(),
      last_name: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type IncidentResponse = z.infer<typeof incidentResponseSchema>;
