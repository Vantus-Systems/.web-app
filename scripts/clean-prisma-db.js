#!/usr/bin/env node
import fs from "fs";
import path from "path";

const candidates = [
  path.join(
    process.cwd(),
    ".output",
    "server",
    "node_modules",
    ".prisma",
    "client",
    "med.db",
  ),
  path.join(
    process.cwd(),
    ".output",
    "server",
    "node_modules",
    ".prisma",
    "client",
    "med.db-journal",
  ),
];

let removed = false;
for (const c of candidates) {
  try {
    if (fs.existsSync(c)) {
      fs.unlinkSync(c);
      console.log("[clean-prisma-db] removed", c);
      removed = true;
    }
  } catch (e) {
    console.warn("[clean-prisma-db] failed to remove", c, e);
  }
}

if (!removed)
  console.log("[clean-prisma-db] no stray prisma med.db files found");
