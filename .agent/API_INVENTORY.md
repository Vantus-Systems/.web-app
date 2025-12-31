# API_INVENTORY

| Method | Path | Handler | Auth/Roles | Validation | Rate Limit | Response |
| --- | --- | --- | --- | --- | --- | --- |
| POST | /api/auth/login | server/api/auth/login.post.ts | Public, rate-limited; sets session | zod username/password | rateLimiter 5/15m per IP | { success, user, cookies auth_token/csrf_token } |
| POST | /api/auth/logout | server/api/auth/logout.post.ts | Requires auth cookie | none | none | { success } + clears cookies |
| GET | /api/auth/user | server/api/auth/user.get.ts | Auth via middleware, returns current user | none | none | { user } or 401 |
| GET | /api/admin/shift-records | server/api/admin/shift-records.get.ts | Auth role OWNER/MIC | query validated shiftRecordQuerySchema | none | list shift records with user info |
| POST | /api/admin/shift-records | server/api/admin/shift-records.post.ts | Permissions mic:edit or ops:edit | shiftRecordInputSchema | none | create shift record with computed totals |
| GET | /api/admin/shift-records/:id | server/api/admin/shift-records/[id].get.ts | Auth role OWNER/MIC | id param required | none | return shift record or 404 |
| PUT | /api/admin/shift-records/:id | server/api/admin/shift-records/[id].put.ts | Auth role OWNER/MIC | shiftRecordUpdateSchema | none | update shift record with recomputed totals |
| DELETE | /api/admin/shift-records/:id | server/api/admin/shift-records/[id].delete.ts | Auth role OWNER/MIC | id param required | none | soft delete shift record |
