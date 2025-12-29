export const rotatePatternCells = (cells: number[]) => {
  if (cells.length !== 25) return cells;
  const rotated = Array(25).fill(0);
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const sourceIndex = row * 5 + col;
      const targetIndex = col * 5 + (4 - row);
      rotated[targetIndex] = cells[sourceIndex];
    }
  }
  rotated[12] = 1;
  return rotated;
};

export const hashPatternCells = (cells: number[]) => cells.join("");

export const countLines = (cells: number[]) => {
  const grid = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => cells[row * 5 + col] === 1),
  );
  grid[2][2] = true;
  let count = 0;
  for (let row = 0; row < 5; row += 1) {
    if (grid[row].every(Boolean)) count += 1;
  }
  for (let col = 0; col < 5; col += 1) {
    if (grid.every((row) => row[col])) count += 1;
  }
  if ([0, 1, 2, 3, 4].every((i) => grid[i][i])) count += 1;
  if ([0, 1, 2, 3, 4].every((i) => grid[i][4 - i])) count += 1;
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
      combo.forEach((idx) => {
        lineSets[idx].forEach((cell) => {
          cells[cell] = 1;
        });
      });
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
      build(i + 1, [...combo, indices[i]]);
    }
  };

  build(0, []);
  if (permutations.length === 0) return [baseCells];
  return permutations;
};
