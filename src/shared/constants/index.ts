export { DEFAULT_CATEGORIES } from "./categories";
export { DEFAULT_ACCOUNTS } from "./accounts";

export const CURRENCIES = [
  { code: "PEN", name: "Sol Peruano", symbol: "S/" },
  { code: "USD", name: "Dólar Americano", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
] as const;

export const DEFAULT_CURRENCY = "PEN";
