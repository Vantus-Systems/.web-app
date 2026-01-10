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
    const dayCode = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
      dayOfWeek
    ] as const;

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
      content.weeklyRotation[String(dayOfWeek) as any];
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

  getSpecialsByDay(
    content: PricingSchemaV2,
  ): Record<string, PricingPromotion[]> {
    const weekSpecials: Record<string, PricingPromotion[]> = {};
    // Note: Pricing V2 typically uses JS day index (0=Sun).
    // But for display we might want Mon-Sun map.

    // Let's iterate 0-6 (Sun-Sat) and map to relevant day codes
    for (let i = 0; i < 7; i++) {
      // Map i to a representative code if needed, or just day index
      // Requirements say "Mon..Sun mapping"
      // Let's use Mon, Tue, etc.
      const d = new Date();
      // Set d to next sunday, then add i
      d.setDate(d.getDate() + ((i - d.getDay() + 7) % 7)); // this logic is flaky for just getting day name

      // Simpler: Just filter promotions that apply to DayOfWeek = i
      // And exclude date-specific ones (one-offs) unless they are huge ranges?
      // Usually "Weekly Specials" means recurring by day of week.

      const recurring = content.promotions
        .filter((p) => {
          if (!p.isActive) return false;
          if (p.date) return false; // Skip one-offs
          if (p.dayOfWeek === undefined) return false; // Must be day specific
          return p.dayOfWeek === i;
        })
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      // Map 0 -> Sun
      const code = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i];
      weekSpecials[code] = recurring;
    }
    return weekSpecials;
  },

  compileForPublic(
    content: PricingContent,
    date: Date = new Date(),
  ): PricingConfig & {
    promotions?: PricingPromotion[];
    todaySpecials?: PricingPromotion[];
    weekSpecialsByDay?: Record<string, PricingPromotion[]>;
    meta?: any;
  } {
    if (!this.isV2(content)) {
      // Legacy V1
      return content as PricingConfig;
    }

    const { config, templateName, isOverride } = this.resolveEffectiveTemplate(
      content,
      date,
    );
    const promotions = this.resolvePromotions(content, date);

    // Today specials are exactly `promotions` (active for today)
    const todaySpecials = promotions;

    const weekSpecialsByDay = this.getSpecialsByDay(content);

    return {
      ...config,
      promotions,
      todaySpecials,
      weekSpecialsByDay,
      meta: {
        effectiveDate: date.toISOString().split("T")[0],
        templateName,
        isOverride,
      },
    };
  },
};
