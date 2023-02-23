import type { RouterOutputs } from "../utils/trpc";

export type Reports = RouterOutputs['mod']['getAllReports'];

export type Report = NonNullable<Reports>[number];