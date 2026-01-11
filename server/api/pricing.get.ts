import { defineEventHandler } from "h3";
import prisma from "~/server/db/client";
import { settingsService } from "@server/services/settings.service";

export default defineEventHandler(async (event) => {
  // 1. Try to fetch active pricing version from database
  const activePricingVersion = await prisma.pricingVersion.findFirst({
    where: { status: "ACTIVE" },
  });

  if (activePricingVersion) {
    try {
      const pricingContent = JSON.parse(activePricingVersion.content);
      return pricingContent;
    } catch (e) {
      console.error("Failed to parse active pricing version content:", e);
    }
  }

  // 2. Fallback to legacy settings service
  const legacyPricing = await settingsService.get("pricing");
  if (legacyPricing) {
    return legacyPricing;
  }

  // 3. Return default pricing structure
  return {
    machines: [
      {
        id: 'm1',
        name: 'Starter Pack',
        description: 'Perfect for beginners',
        price: 35.00,
        unit: 'Session',
        featured: false,
        features: [
          '36 Cards (Level 1)',
          '1 Electronic Handset',
          'Standard Payout Eligibility'
        ]
      },
      {
        id: 'm2',
        name: 'Pro Player',
        description: 'Most Popular Choice',
        price: 55.00,
        unit: 'Session',
        featured: true,
        features: [
          '66 Cards (Level 1)',
          '1 Electronic Handset',
          'Double Action Included',
          'Bonanza Strip Included'
        ]
      },
      {
        id: 'm3',
        name: 'High Roller',
        description: 'Maximum Action',
        price: 85.00,
        unit: 'Session',
        featured: false,
        features: [
          '120 Cards (Max Load)',
          'Premium Handset',
          'All Special Games Included',
          'VIP Seating Priority'
        ]
      }
    ],
    paper: [
      {
        id: 'p1',
        name: '6-ON Entry',
        description: 'Traditional Paper',
        price: 15.00,
        unit: 'Pack',
        featured: false,
        features: [
          '6 Cards per game',
          'Valid for all Regular Games',
          'Dauber required (sold separately)'
        ]
      },
      {
        id: 'p2',
        name: 'Double Pack',
        description: 'Better Odds',
        price: 25.00,
        unit: 'Pack',
        featured: true,
        features: [
          '12 Cards per game',
          'Valid for all Regular Games',
          'Includes 1 Bonanza Sheet'
        ]
      }
    ],
    extras: [
      {
        id: 'e1',
        name: 'Pro Dauber',
        description: 'Various Colors',
        price: 2.00,
        unit: 'Each',
        features: ['Non-smearing ink', 'Ergonomic grip']
      },
      {
        id: 'e2',
        name: 'Bonanza Sheet',
        description: 'Progressive Jackpot',
        price: 1.00,
        unit: 'Sheet',
        features: ['Jackpot starts at $500', 'Coverall Pattern']
      }
    ]
  };
});
