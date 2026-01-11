import { describe, it, expect, vi, beforeEach } from "vitest";

// Import handler after mocking
import handlerModule from "~/server/api/pricing.get";
import { settingsService } from "~/server/services/settings.service";
import { PrismaClient } from "@prisma/client";

// Mock settingsService and PrismaClient before importing the handler
vi.mock("../../server/services/settings.service", () => ({
  settingsService: {
    get: vi.fn(),
  },
}));

vi.mock("@prisma/client", () => {
  const mockPrisma = {
    pricingVersion: {
      findFirst: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

describe("/api/pricing GET handler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("Promotions Functionality", () => {
    it("should return promotions from active pricing version", async () => {
      const testPricing = {
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
            id: "promo-1",
            title: "Senior Discount",
            description: "50% off for seniors on Wednesdays",
            badge: "50% OFF",
            dayOfWeek: 3, // Wednesday
            isActive: true,
            sortOrder: 1
          },
          {
            id: "promo-2",
            title: "Weekend Special",
            description: "Buy 1 get 1 free on weekends",
            dayOfWeek: 6, // Saturday
            isActive: true,
            sortOrder: 2
          }
        ],
        defaultTemplateId: "default"
      };

      // Mock active pricing version
      mockPrisma.pricingVersion.findFirst.mockResolvedValue({
        status: "ACTIVE",
        content: JSON.stringify(testPricing),
        published_at: new Date().toISOString(),
        published_by: "test-user"
      });

      const result = await (handlerModule as any).default({} as any);

      expect(result).toBeDefined();
      expect(result.promotions).toBeDefined();
      expect(Array.isArray(result.promotions)).toBe(true);
      expect(result.promotions.length).toBeGreaterThan(0);

      // Check that promotions are filtered for the current day
      const today = new Date();
      const dayOfWeek = today.getDay();

      // Verify day-specific promotions
      const wednesdayPromo = result.promotions.find((p: any) => p.id === "promo-1");
      const saturdayPromo = result.promotions.find((p: any) => p.id === "promo-2");

      if (dayOfWeek === 3) { // Wednesday
        expect(wednesdayPromo).toBeDefined();
        expect(saturdayPromo).toBeUndefined();
      } else if (dayOfWeek === 6) { // Saturday
        expect(wednesdayPromo).toBeUndefined();
        expect(saturdayPromo).toBeDefined();
      } else {
        expect(wednesdayPromo).toBeUndefined();
        expect(saturdayPromo).toBeUndefined();
      }
    });

    it("should filter out inactive promotions", async () => {
      const testPricing = {
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

      mockPrisma.pricingVersion.findFirst.mockResolvedValue({
        status: "ACTIVE",
        content: JSON.stringify(testPricing),
        published_at: new Date().toISOString(),
        published_by: "test-user"
      });

      const result = await (handlerModule as any).default({} as any);

      expect(result.promotions).toBeDefined();
      expect(result.promotions.length).toBe(1);
      expect(result.promotions[0].id).toBe("active-promo");
    });

    it("should sort promotions by sortOrder", async () => {
      const testPricing = {
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

      mockPrisma.pricingVersion.findFirst.mockResolvedValue({
        status: "ACTIVE",
        content: JSON.stringify(testPricing),
        published_at: new Date().toISOString(),
        published_by: "test-user"
      });

      const result = await (handlerModule as any).default({} as any);

      expect(result.promotions).toBeDefined();
      expect(result.promotions.length).toBe(3);
      expect(result.promotions[0].id).toBe("promo-1"); // First by sortOrder
      expect(result.promotions[1].id).toBe("promo-2"); // Second by sortOrder
      expect(result.promotions[2].id).toBe("promo-3"); // Third by sortOrder
    });
  });

  describe("Backward Compatibility", () => {
    it("should fallback to legacy settings when no active pricing version exists", async () => {
      // Mock no active pricing version
      mockPrisma.pricingVersion.findFirst.mockResolvedValue(null);

      // Mock legacy settings
      const legacyPricing = {
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

      (settingsService.get as any).mockResolvedValue(legacyPricing);

      const result = await (handlerModule as any).default({} as any);

      expect(result).toBeDefined();
      expect(result.daytime).toBeDefined();
      expect(result.daytime.sessions).toBeDefined();
      expect(result.daytime.sessions.length).toBe(1);
      expect(settingsService.get as any).toHaveBeenCalledWith("pricing");
    });

    it("should handle malformed active pricing version gracefully", async () => {
      // Mock malformed active pricing version
      mockPrisma.pricingVersion.findFirst.mockResolvedValue({
        status: "ACTIVE",
        content: "invalid json content",
        published_at: new Date().toISOString(),
        published_by: "test-user"
      });

      // Mock legacy settings
      const legacyPricing = {
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

      (settingsService.get as any).mockResolvedValue(legacyPricing);

      const result = await (handlerModule as any).default({} as any);

      // Should fallback to legacy settings
      expect(result).toBeDefined();
      expect(result.daytime).toBeDefined();
      expect(settingsService.get as any).toHaveBeenCalledWith("pricing");
    });

    it("should return empty object when no data is available", async () => {
      // Mock no active pricing version
      mockPrisma.pricingVersion.findFirst.mockResolvedValue(null);

      // Mock no legacy settings
      (settingsService.get as any).mockResolvedValue(null);

      const result = await (handlerModule as any).default({} as any);

      expect(result).toBeDefined();
      expect(result).toEqual({});
    });
  });

  describe("Edge Cases", () => {
    it("should handle date-specific promotions correctly", async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const testPricing = {
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
            id: "today-promo",
            title: "Today's Promotion",
            description: "Valid only today",
            date: todayStr,
            isActive: true,
            sortOrder: 1
          },
          {
            id: "yesterday-promo",
            title: "Yesterday's Promotion",
            description: "Valid only yesterday",
            date: yesterdayStr,
            isActive: true,
            sortOrder: 2
          },
          {
            id: "tomorrow-promo",
            title: "Tomorrow's Promotion",
            description: "Valid only tomorrow",
            date: tomorrowStr,
            isActive: true,
            sortOrder: 3
          }
        ],
        defaultTemplateId: "default"
      };

      mockPrisma.pricingVersion.findFirst.mockResolvedValue({
        status: "ACTIVE",
        content: JSON.stringify(testPricing),
        published_at: new Date().toISOString(),
        published_by: "test-user"
      });

      const result = await (handlerModule as any).default({} as any);

      expect(result.promotions).toBeDefined();
      expect(result.promotions.length).toBe(1);
      expect(result.promotions[0].id).toBe("today-promo");
    });

    it("should handle date range promotions correctly", async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const testPricing = {
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
            id: "past-promo",
            title: "Past Promotion",
            description: "Already ended",
            endDate: yesterdayStr,
            isActive: true,
            sortOrder: 1
          },
          {
            id: "current-promo",
            title: "Current Promotion",
            description: "Currently active",
            startDate: yesterdayStr,
            endDate: tomorrowStr,
            isActive: true,
            sortOrder: 2
          },
          {
            id: "future-promo",
            title: "Future Promotion",
            description: "Starts tomorrow",
            startDate: tomorrowStr,
            isActive: true,
            sortOrder: 3
          }
        ],
        defaultTemplateId: "default"
      };

      mockPrisma.pricingVersion.findFirst.mockResolvedValue({
        status: "ACTIVE",
        content: JSON.stringify(testPricing),
        published_at: new Date().toISOString(),
        published_by: "test-user"
      });

      const result = await (handlerModule as any).default({} as any);

      expect(result.promotions).toBeDefined();
      expect(result.promotions.length).toBe(1);
      expect(result.promotions[0].id).toBe("current-promo");
    });
  });
});