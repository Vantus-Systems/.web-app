// eslint-disable-next-line import/default
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default prisma;
