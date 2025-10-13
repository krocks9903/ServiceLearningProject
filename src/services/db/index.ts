import * as real from "./hours";
import * as mock from "./hours.mock";

// toggle via env var
const useMock = String(import.meta.env.VITE_USE_MOCK_DB).toLowerCase() === "true";
console.log("[DB] mode =>", useMock ? "MOCK" : "REAL");

const api = useMock ? mock : real;

export const listMyHours = api.listMyHours;
export const addMyHours = api.addMyHours;

// Types re-exported from the real module (same shape in mock)
export type { HourEntry } from "./hours";
