import prisma from '@server/db/client'
import { auditService } from '@server/services/audit.service'

export const settingsService = {
  async get(key: string) {
    const setting = await prisma.siteSetting.findUnique({
      where: { key },
    })
    return setting?.value || null
  },

  async set(key: string, value: any, actorUserId: string) {
    const current = await this.get(key)

    const updated = await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    await auditService.log({
      actorUserId,
      action: 'UPDATE',
      entity: `settings:${key}`,
      before: current,
      after: value,
    })

    return updated.value
  },
}
