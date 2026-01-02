export const rotatePatternCells = (cells: number[]) => {
  if (cells.length !== 25) return cells;
  const rotated = Array(25).fill(0);
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const sourceIndex = row * 5 + col;
      const targetIndex = col * 5 + (4 - row);
      rotated[targetIndex] = cells[sourceIndex] ?? 0;
    }
  }
  rotated[12] = 1;
  return rotated;
};

export const hashPatternCells = (cells: number[]) => cells.join("");

export const countLines = (cells: number[]) => {
  const grid: boolean[][] = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => cells[row * 5 + col] === 1),
  );
  grid[2]![2] = true;
  let count = 0;
  for (let row = 0; row < 5; row += 1) {
    if (grid[row]!.every(Boolean)) count += 1;
  }
  for (let col = 0; col < 5; col += 1) {
    if (grid.every((r) => r[col] === true)) count += 1;
  }
  if ([0, 1, 2, 3, 4].every((i) => grid[i]![i] === true)) count += 1;
  if ([0, 1, 2, 3, 4].every((i) => grid[i]![4 - i] === true)) count += 1;
  return count;
};

export const generateLinePermutations = (
  baseCells: number[],
  lineCount: number,
) => {
  const permutations: number[][] = [];
  const seen = new Set<string>();
  const lineSets: number[][] = [];
  for (let row = 0; row < 5; row += 1) {
    lineSets.push(Array.from({ length: 5 }, (_, col) => row * 5 + col));
  }
  for (let col = 0; col < 5; col += 1) {
    lineSets.push(Array.from({ length: 5 }, (_, row) => row * 5 + col));
  }
  lineSets.push([0, 6, 12, 18, 24]);
  lineSets.push([4, 8, 12, 16, 20]);

  const indices = Array.from({ length: lineSets.length }, (_, i) => i);
  const build = (start: number, combo: number[]) => {
    if (combo.length === lineCount) {
      const cells = Array(25).fill(0);
      for (const idx of combo) {
        const set = lineSets[idx];
        if (!set) continue;
        for (const cell of set) {
          cells[cell] = 1;
        }
      }
      cells[12] = 1;
      if (countLines(cells) !== lineCount) return;
      const hash = hashPatternCells(cells);
      if (!seen.has(hash)) {
        seen.add(hash);
        permutations.push(cells);
      }
      return;
    }
    for (let i = start; i < indices.length; i += 1) {
      if (permutations.length >= 25) return;
      const next = indices[i];
      if (next === undefined) continue;
      build(i + 1, [...combo, next]);
    }
  };

  build(0, []);
  if (permutations.length === 0) return [baseCells];
  return permutations;
};

// --- New Generators ---

const STAMPS = [
  [0, 1, 5, 6], // Top-Left
  [3, 4, 8, 9], // Top-Right
  [15, 16, 20, 21], // Bottom-Left
  [18, 19, 23, 24], // Bottom-Right
];

const FOUR_CORNERS = [0, 4, 20, 24];

export const generateTripleBingoPermutations = (
  includeStamps: boolean,
  includeCorners: boolean,
) => {
  const permutations: number[][] = [];
  const seen = new Set<string>();

  // 1. Define all "Bingo" shapes (Lines, Stamps, Corners)
  const shapes: number[][] = [];

  // Rows
  for (let row = 0; row < 5; row += 1) {
    shapes.push(Array.from({ length: 5 }, (_, col) => row * 5 + col));
  }
  // Cols
  for (let col = 0; col < 5; col += 1) {
    shapes.push(Array.from({ length: 5 }, (_, row) => row * 5 + col));
  }
  // Diagonals
  shapes.push([0, 6, 12, 18, 24]);
  shapes.push([4, 8, 12, 16, 20]);

  if (includeStamps) {
    STAMPS.forEach((s) => shapes.push(s));
  }
  if (includeCorners) {
    shapes.push(FOUR_CORNERS);
  }

  // 2. Generate combinations of 3 shapes
  const indices = Array.from({ length: shapes.length }, (_, i) => i);
  const targetCount = 3;

  const build = (start: number, combo: number[]) => {
    if (combo.length === targetCount) {
      const cells = Array(25).fill(0);
      for (const idx of combo) {
        const shape = shapes[idx];
        if (shape) {
          for (const cell of shape) {
            cells[cell] = 1;
          }
        }
      }
      cells[12] = 1; // Free space

      const hash = hashPatternCells(cells);
      if (!seen.has(hash)) {
        seen.add(hash);
        permutations.push(cells);
      }
      return;
    }

    for (let i = start; i < indices.length; i += 1) {
      // Limit to prevent browser crash if too many, though 17C3 is small (680)
      if (permutations.length >= 2000) return;
      const indexValue = indices[i];
      if (indexValue !== undefined) {
        build(i + 1, [...combo, indexValue]);
      }
    }
  };

  build(0, []);
  return permutations;
};

export const generateSnakePattern = () => {
  // A snake chasing its tail around the perimeter and spiraling in
  // Path: 0->1->2->3->4 -> 9->14->19->24 -> 23->22->21->20 -> 15->10->5 -> 6->7->8 -> 13->18 -> 17->16 -> 11
  // Total length 24 (excluding center). Center is 12.
  const path = [
    0, 1, 2, 3, 4, 9, 14, 19, 24, 23, 22, 21, 20, 15, 10, 5, 6, 7, 8, 13, 18,
    17, 16, 11,
  ];

  const frames: number[][] = [];
  const snakeLength = 5;

  // Generate frames where the snake moves along the path
  for (let i = 0; i < path.length; i++) {
    const cells = Array(25).fill(0);
    cells[12] = 1; // Free space always on? Or maybe snake covers it? Let's keep free space.

    for (let j = 0; j < snakeLength; j++) {
      const pathIndex = (i - j + path.length) % path.length;
      const cellIndex = path[pathIndex];
      if (cellIndex !== undefined) {
        cells[cellIndex] = 1;
      }
    }
    frames.push(cells);
  }

  return frames;
};
