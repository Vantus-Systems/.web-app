import {
  toOperationalMinutes,
  normalizeRangeToOperational,
} from "../utils/ops-schema.utils";

console.log("Running ops-schema.utils tests...");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`PASS: ${message}`);
    passed++;
  } else {
    console.error(`FAIL: ${message}`);
    failed++;
  }
}

// Test toOperationalMinutes
// Operational start: 09:00
const opStart = "09:00";

try {
  const t1 = toOperationalMinutes("09:00", opStart);
  assert(t1 === 0, `09:00 is 0 min (got ${t1})`);

  const t2 = toOperationalMinutes("10:00", opStart);
  assert(t2 === 60, `10:00 is 60 min (got ${t2})`);

  const t3 = toOperationalMinutes("23:00", opStart);
  assert(t3 === 840, `23:00 is 840 min (got ${t3})`);

  // 00:30 is next day relative to 09:00 start
  // 00:30 = 30 min. 09:00 = 540 min.
  // 30 < 540, so 30 + 1440 - 540 = 1470 - 540 = 930
  const t4 = toOperationalMinutes("00:30", opStart);
  assert(t4 === 930, `00:30 is 930 min (cross midnight) (got ${t4})`);

  const t5 = toOperationalMinutes("03:00", opStart);
  assert(t5 === 1080, `03:00 is 1080 min (got ${t5})`);

  // Test normalizeRangeToOperational
  const range1 = normalizeRangeToOperational("09:00", "12:00", opStart);
  assert(range1.start === 0, `Range1 start 0 (got ${range1.start})`);
  assert(range1.end === 180, `Range1 end 180 (got ${range1.end})`);
  assert(
    range1.duration === 180,
    `Range1 duration 180 (got ${range1.duration})`,
  );

  const range2 = normalizeRangeToOperational("23:00", "00:30", opStart);
  assert(range2.start === 840, `Range2 start 840 (got ${range2.start})`);
  assert(range2.end === 930, `Range2 end 930 (got ${range2.end})`);
  assert(range2.duration === 90, `Range2 duration 90 (got ${range2.duration})`);

  const range3 = normalizeRangeToOperational("23:00", "01:00", opStart);
  assert(
    range3.duration === 120,
    `Range3 duration 120 (got ${range3.duration})`,
  );
} catch (e) {
  console.error("Exception during tests:", e);
  failed++;
}

console.log(`\nTests finished. Passed: ${passed}, Failed: ${failed}`);
if (failed > 0) process.exit(1);
