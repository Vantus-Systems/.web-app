import { describe, it, expect } from "vitest";
import { computed, ref } from "vue";

// Mock definitions
const pattern = {
    slug: "test",
    definition: {
        frames: [
            [0,0,0,0,0, 0,0,0,0,0, 0,0,1,0,0, 0,0,0,0,0, 0,0,0,0,0], // 1 active cell
            [1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1], // 25 active cells
        ]
    }
};

describe("ProgramEditor Logic", () => {
    it("should calculate active cells correctly", () => {
        const selectedPattern = ref(pattern);
        const currentFrame = ref(0);
        
        const currentActiveCells = computed(() => {
           if (!selectedPattern.value?.definition?.frames) return 0;
           const frame = selectedPattern.value.definition.frames[currentFrame.value];
           if (!frame) return 0;
           return frame.reduce((sum: number, cell: number) => sum + (cell ? 1 : 0), 0);
        });

        expect(currentActiveCells.value).toBe(1);
        
        currentFrame.value = 1;
        expect(currentActiveCells.value).toBe(25);
    });

    it("should calculate max frames correctly", () => {
        const selectedPattern = ref(pattern);
        const maxFrames = computed(() => {
            if (!selectedPattern.value?.definition?.frames) return 1;
            return selectedPattern.value.definition.frames.length;
        });

        expect(maxFrames.value).toBe(2);
    });

    it("should calculate payout density correctly", () => {
        const selectedGame = ref({
            payout: { amount: 100 },
            timeline: { estimatedDuration: 10 }
        });

        const payoutDensity = computed(() => {
            const amount = Number(selectedGame.value?.payout?.amount) || 0;
            const duration = Number(selectedGame.value?.timeline?.estimatedDuration) || 1;
            return (amount / duration).toFixed(2);
        });

        expect(payoutDensity.value).toBe("10.00");

        selectedGame.value.payout.amount = 33;
        selectedGame.value.timeline.estimatedDuration = 10;
        expect(payoutDensity.value).toBe("3.30");
    });

    it("should calculate saturation percentage correctly", () => {
        const currentActiveCells = ref(0);
        const saturationPercentage = computed(() => {
           return Math.round((currentActiveCells.value / 25) * 100);
        });

        currentActiveCells.value = 1;
        expect(saturationPercentage.value).toBe(4);

        currentActiveCells.value = 13; // ~52%
        expect(saturationPercentage.value).toBe(52);

        currentActiveCells.value = 25;
        expect(saturationPercentage.value).toBe(100);
    });
});
