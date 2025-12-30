/**
 * Operations Builder Templates
 * Pre-configured templates for common operational scenarios
 */

export interface OpsTemplate {
  id: string;
  name: string;
  description: string;
  category: 'weekday' | 'weekend' | 'special' | 'custom';
  config: {
    rateCards?: any[];
    timeline?: any;
    dayProfiles?: any[];
    calendar?: any;
  };
}

export const opsTemplates: OpsTemplate[] = [
  {
    id: 'weekday-standard',
    name: 'Weekday Standard',
    description: 'Standard weekday configuration with evening sessions',
    category: 'weekday',
    config: {
      rateCards: [
        {
          name: 'Regular',
          pricePerSheet: 0.50,
          sheetsPerPack: 6,
          packPrice: 3.00,
        },
      ],
      timeline: {
        flowSegments: [
          { type: 'warmup', durationMinutes: 15 },
          { type: 'session', durationMinutes: 120 },
          { type: 'break', durationMinutes: 10 },
        ],
      },
      dayProfiles: [
        {
          name: 'Weekday Evening',
          startTime: '18:00',
          endTime: '22:00',
          sessionCount: 2,
        },
      ],
    },
  },
  {
    id: 'weekend-marathon',
    name: 'Weekend Marathon',
    description: 'Extended weekend sessions with multiple breaks',
    category: 'weekend',
    config: {
      rateCards: [
        {
          name: 'Weekend Special',
          pricePerSheet: 0.75,
          sheetsPerPack: 6,
          packPrice: 4.50,
        },
      ],
      timeline: {
        flowSegments: [
          { type: 'warmup', durationMinutes: 20 },
          { type: 'session', durationMinutes: 90 },
          { type: 'break', durationMinutes: 15 },
          { type: 'session', durationMinutes: 90 },
          { type: 'break', durationMinutes: 15 },
          { type: 'session', durationMinutes: 90 },
        ],
      },
      dayProfiles: [
        {
          name: 'Saturday Afternoon',
          startTime: '13:00',
          endTime: '18:00',
          sessionCount: 3,
        },
      ],
    },
  },
  {
    id: 'special-event',
    name: 'Special Event',
    description: 'Holiday or special event configuration with premium pricing',
    category: 'special',
    config: {
      rateCards: [
        {
          name: 'Premium',
          pricePerSheet: 1.00,
          sheetsPerPack: 6,
          packPrice: 6.00,
        },
        {
          name: 'VIP',
          pricePerSheet: 1.50,
          sheetsPerPack: 6,
          packPrice: 9.00,
        },
      ],
      timeline: {
        flowSegments: [
          { type: 'warmup', durationMinutes: 30 },
          { type: 'session', durationMinutes: 120 },
          { type: 'break', durationMinutes: 20 },
          { type: 'session', durationMinutes: 120 },
        ],
      },
      dayProfiles: [
        {
          name: 'Special Event',
          startTime: '19:00',
          endTime: '23:30',
          sessionCount: 2,
        },
      ],
    },
  },
];

export function getTemplateById(id: string): OpsTemplate | undefined {
  return opsTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): OpsTemplate[] {
  return opsTemplates.filter((t) => t.category === category);
}
