import {
  type PricingContent,
  type PricingSchemaV2,
  type PricingConfig,
  type PricingPromotion,
} from "~/types/pricing";

export const pricingCompiler = {
  isV2(content: any): content is PricingSchemaV2 {
    return content && content.schemaVersion === 2;
  },

  resolveEffectiveTemplate(
    content: PricingSchemaV2,
    date: Date = new Date(),
  ): { config: PricingConfig; templateName: string; isOverride: boolean } {
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay(); // 0 = Sunday
    const weekdayCodes = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ] as const;
    const dayCode = weekdayCodes[dayOfWeek];

    // 1. Check for date override
    const override = content.dateOverrides.find((o) => o.date === dateStr);
    if (override) {
      const template = content.templates.find(
        (t) => t.id === override.templateId,
      );
      if (template) {
        return {
          config: template.config,
          templateName: template.name,
          isOverride: true,
        };
      }
    }

    // 2. Check for weekly rotation
    const rotationTemplateId =
      content.weeklyRotation[dayCode] ??
      content.weeklyRotation[String(dayOfWeek)];
    if (rotationTemplateId) {
      const template = content.templates.find(
        (t) => t.id === rotationTemplateId,
      );
      if (template) {
        return {
          config: template.config,
          templateName: template.name,
          isOverride: false,
        };
      }
    }

    // 3. Fallback to default
    const defaultTemplate = content.templates.find(
      (t) => t.id === content.defaultTemplateId,
    );
    if (defaultTemplate) {
      return {
        config: defaultTemplate.config,
        templateName: defaultTemplate.name,
        isOverride: false,
      };
    }

    // 4. Absolute fallback (should not happen if validated)
    return {
      config: {},
      templateName: "Unknown",
      isOverride: false,
    };
  },

  resolvePromotions(
    content: PricingSchemaV2,
    date: Date = new Date(),
  ): PricingPromotion[] {
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();

    return content.promotions
      .filter((p) => {
        if (!p.isActive) return false;

        // Date specific
        if (p.date && p.date !== dateStr) return false;

        // Day of week specific
        if (p.dayOfWeek !== undefined && p.dayOfWeek !== dayOfWeek) {
          return false;
        }

        // Date range
        if (p.startDate && p.startDate > dateStr) return false;
        if (p.endDate && p.endDate < dateStr) return false;

        return true;
      })
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  compileForPublic(
    content: PricingContent,
    date: Date = new Date(),
  ): PricingConfig & { promotions?: PricingPromotion[]; meta?: any } {
    if (!this.isV2(content)) {
      // Legacy V1
      return content as PricingConfig;
    }

    const { config, templateName, isOverride } = this.resolveEffectiveTemplate(
      content,
      date,
    );
    const promotions = this.resolvePromotions(content, date);

    return {
      ...config,
      promotions,
      meta: {
        effectiveDate: date.toISOString().split("T")[0],
        templateName,
        isOverride,
      },
    };
  },
};
