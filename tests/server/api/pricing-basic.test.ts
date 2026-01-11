import { describe, it, expect } from "vitest";
import { pricingCompiler } from "~/server/services/pricingCompiler";

describe("Pricing Compiler - Promotions", () => {
  describe("resolvePromotions", () => {
    it("should filter promotions by active status", () => {
      const content = {
        schemaVersion: 2,
        templates: [],
        weeklyRotation: {},
        dateOverrides: [],
        promotions: [
          {
            id: "active-promo",
            title: "Active Promotion",
            description: "This promotion is active",
            isActive: true,
            sortOrder: 1
          },
          {
            id: "inactive-promo",
            title: "Inactive Promotion",
            description: "This promotion is not active",
            isActive: false,
            sortOrder: 2
          }
        ],
        defaultTemplateId: "default"
      };

      const result = pricingCompiler.resolvePromotions(content, new Date());

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("active-promo");
    });

    it("should filter promotions by day of week", () => {
      const content = {
        schemaVersion: 2,
        templates: [],
        weeklyRotation: {},
        dateOverrides: [],
        promotions: [
          {
            id: "wednesday-promo",
            title: "Wednesday Promotion",
            description: "Valid only on Wednesdays",
            dayOfWeek: 3, // Wednesday
            isActive: true,
            sortOrder: 1
          },
          {
            id: "saturday-promo",
            title: "Saturday Promotion",
            description: "Valid only on Saturdays",
            dayOfWeek: 6, // Saturday
            isActive: true,
            sortOrder: 2
          }
        ],
        defaultTemplateId: "default"
      };

      // Test for Wednesday
      const wednesday = new Date("2026-01-07"); // A Wednesday
      const wednesdayResult = pricingCompiler.resolvePromotions(content, wednesday);

      expect(wednesdayResult).toBeDefined();
      expect(wednesdayResult.length).toBe(1);
      expect(wednesdayResult[0].id).toBe("wednesday-promo");

      // Test for Saturday
      const saturday = new Date("2026-01-10"); // A Saturday
      const saturdayResult = pricingCompiler.resolvePromotions(content, saturday);

      expect(saturdayResult).toBeDefined();
      expect(saturdayResult.length).toBe(1);
      expect(saturdayResult[0].id).toBe("saturday-promo");

      // Test for Monday (no promotions)
      const monday = new Date("2026-01-05"); // A Monday
      const mondayResult = pricingCompiler.resolvePromotions(content, monday);

      expect(mondayResult).toBeDefined();
      expect(mondayResult.length).toBe(0);
    });

    it("should filter promotions by specific date", () => {
      const content = {
        schemaVersion: 2,
        templates: [],
        weeklyRotation: {},
        dateOverrides: [],
        promotions: [
          {
            id: "today-promo",
            title: "Today's Promotion",
            description: "Valid only today",
            date: "2026-01-10",
            isActive: true,
            sortOrder: 1
          },
          {
            id: "yesterday-promo",
            title: "Yesterday's Promotion",
            description: "Valid only yesterday",
            date: "2026-01-09",
            isActive: true,
            sortOrder: 2
          }
        ],
        defaultTemplateId: "default"
      };

      // Test for today
      const today = new Date("2026-01-10");
      const todayResult = pricingCompiler.resolvePromotions(content, today);

      expect(todayResult).toBeDefined();
      expect(todayResult.length).toBe(1);
      expect(todayResult[0].id).toBe("today-promo");

      // Test for yesterday
      const yesterday = new Date("2026-01-09");
      const yesterdayResult = pricingCompiler.resolvePromotions(content, yesterday);

      expect(yesterdayResult).toBeDefined();
      expect(yesterdayResult.length).toBe(1);
      expect(yesterdayResult[0].id).toBe("yesterday-promo");

      // Test for tomorrow (no promotions)
      const tomorrow = new Date("2026-01-11");
      const tomorrowResult = pricingCompiler.resolvePromotions(content, tomorrow);

      expect(tomorrowResult).toBeDefined();
      expect(tomorrowResult.length).toBe(0);
    });

    it("should filter promotions by date range", () => {
      const content = {
        schemaVersion: 2,
        templates: [],
        weeklyRotation: {},
        dateOverrides: [],
        promotions: [
          {
            id: "past-promo",
            title: "Past Promotion",
            description: "Already ended",
            endDate: "2026-01-08",
            isActive: true,
            sortOrder: 1
          },
          {
            id: "current-promo",
            title: "Current Promotion",
            description: "Currently active",
            startDate: "2026-01-09",
            endDate: "2026-01-11",
            isActive: true,
            sortOrder: 2
          },
          {
            id: "future-promo",
            title: "Future Promotion",
            description: "Starts tomorrow",
            startDate: "2026-01-11",
            isActive: true,
            sortOrder: 3
          }
        ],
        defaultTemplateId: "default"
      };

      // Test for today (2026-01-10)
      const today = new Date("2026-01-10");
      const todayResult = pricingCompiler.resolvePromotions(content, today);

      expect(todayResult).toBeDefined();
      expect(todayResult.length).toBe(1);
      expect(todayResult[0].id).toBe("current-promo");
    });

    it("should sort promotions by sortOrder", () => {
      const content = {
        schemaVersion: 2,
        templates: [],
        weeklyRotation: {},
        dateOverrides: [],
        promotions: [
          {
            id: "promo-3",
            title: "Third Promotion",
            description: "Should be third",
            isActive: true,
            sortOrder: 3
          },
          {
            id: "promo-1",
            title: "First Promotion",
            description: "Should be first",
            isActive: true,
            sortOrder: 1
          },
          {
            id: "promo-2",
            title: "Second Promotion",
            description: "Should be second",
            isActive: true,
            sortOrder: 2
          }
        ],
        defaultTemplateId: "default"
      };

      const result = pricingCompiler.resolvePromotions(content, new Date());

      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].id).toBe("promo-1"); // First by sortOrder
      expect(result[1].id).toBe("promo-2"); // Second by sortOrder
      expect(result[2].id).toBe("promo-3"); // Third by sortOrder
    });
  });

  describe("getSpecialsByDay", () => {
    it("should return weekly specials organized by day", () => {
      const content = {
        schemaVersion: 2,
        templates: [],
        weeklyRotation: {},
        dateOverrides: [],
        promotions: [
          {
            id: "mon-promo",
            title: "Monday Special",
            description: "Monday special offer",
            dayOfWeek: 1, // Monday
            isActive: true,
            sortOrder: 1
          },
          {
            id: "wed-promo",
            title: "Wednesday Special",
            description: "Wednesday special offer",
            dayOfWeek: 3, // Wednesday
            isActive: true,
            sortOrder: 1
          },
          {
            id: "fri-promo",
            title: "Friday Special",
            description: "Friday special offer",
            dayOfWeek: 5, // Friday
            isActive: true,
            sortOrder: 1
          }
        ],
        defaultTemplateId: "default"
      };

      const result = pricingCompiler.getSpecialsByDay(content);

      expect(result).toBeDefined();
      expect(result.Mon).toBeDefined();
      expect(result.Mon.length).toBe(1);
      expect(result.Mon[0].id).toBe("mon-promo");

      expect(result.Wed).toBeDefined();
      expect(result.Wed.length).toBe(1);
      expect(result.Wed[0].id).toBe("wed-promo");

      expect(result.Fri).toBeDefined();
      expect(result.Fri.length).toBe(1);
      expect(result.Fri[0].id).toBe("fri-promo");
    });

    it("should exclude date-specific promotions from weekly specials", () => {
      const content = {
        schemaVersion: 2,
        templates: [],
        weeklyRotation: {},
        dateOverrides: [],
        promotions: [
          {
            id: "weekly-promo",
            title: "Weekly Special",
            description: "Weekly special offer",
            dayOfWeek: 1, // Monday
            isActive: true,
            sortOrder: 1
          },
          {
            id: "date-promo",
            title: "Date Specific Special",
            description: "Date specific special offer",
            date: "2026-01-10",
            isActive: true,
            sortOrder: 1
          }
        ],
        defaultTemplateId: "default"
      };

      const result = pricingCompiler.getSpecialsByDay(content);

      expect(result).toBeDefined();
      expect(result.Mon).toBeDefined();
      expect(result.Mon.length).toBe(1);
      expect(result.Mon[0].id).toBe("weekly-promo");

      // Date-specific promotions should not appear in weekly specials
      expect(result.Mon.find(p => p.id === "date-promo")).toBeUndefined();
    });
  });

  describe("compileForPublic", () => {
    it("should include promotions in compiled output for V2 schema", () => {
      const content = {
        schemaVersion: 2,
        templates: [
          {
            id: "default",
            name: "Standard Pricing",
            config: {
              daytime: {
                sessions: [
                  {
                    name: "Morning Play",
                    timeRange: "10:30 AM – 12:30 PM",
                    icon: "sun",
                    machines: [
                      {
                        description: "1 Machine",
                        price: "$1",
                        type: "individual"
                      }
                    ],
                    paperRules: {
                      minSpend: "$1",
                      minPaperCards: 1,
                      description: "Spend $1+ to receive 1 free paper card"
                    },
                    paperRulesAdvanced: {
                      minSpendAdvanced: "$2+",
                      maxPaperCards: "Unlimited",
                      description: "Spend $2 or more to receive as many paper cards as you'd like"
                    }
                  }
                ],
                jackpots: []
              },
              evening: {
                startTime: "7:30 PM",
                valueProposition: "Evening session",
                scheduleNote: "Main session",
                machines: [
                  {
                    description: "1 Machine",
                    price: "$11",
                    type: "individual"
                  }
                ]
              }
            }
          }
        ],
        weeklyRotation: {
          Mon: "default",
          Tue: "default",
          Wed: "default",
          Thu: "default",
          Fri: "default",
          Sat: "default",
          Sun: "default"
        },
        dateOverrides: [],
        promotions: [
          {
            id: "test-promo",
            title: "Test Promotion",
            description: "Test promotion description",
            isActive: true,
            sortOrder: 1
          }
        ],
        defaultTemplateId: "default"
      };

      const result = pricingCompiler.compileForPublic(content, new Date());

      expect(result).toBeDefined();
      expect(result.promotions).toBeDefined();
      expect(Array.isArray(result.promotions)).toBe(true);
      expect(result.promotions.length).toBe(1);
      expect(result.promotions[0].id).toBe("test-promo");

      // Should also have todaySpecials (same as promotions)
      expect(result.todaySpecials).toBeDefined();
      expect(result.todaySpecials).toEqual(result.promotions);

      // Should have weekSpecialsByDay
      expect(result.weekSpecialsByDay).toBeDefined();
    });

    it("should handle legacy V1 schema without promotions", () => {
      const content = {
        daytime: {
          sessions: [
            {
              name: "Morning Play",
              timeRange: "10:30 AM – 12:30 PM",
              icon: "sun",
              machines: [
                {
                  description: "1 Machine",
                  price: "$1",
                  type: "individual"
                }
              ]
            }
          ]
        }
      };

      const result = pricingCompiler.compileForPublic(content, new Date());

      expect(result).toBeDefined();
      expect(result.daytime).toBeDefined();
      // Legacy V1 should not have promotions
      expect(result.promotions).toBeUndefined();
    });
  });
});