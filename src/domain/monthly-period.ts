export type MonthlyPeriod = {
  periodStart: string;
  periodEnd: string;
};

/** Converts the one month a user selects into the complete reporting period. */
export function monthlyPeriodBounds(month: string): MonthlyPeriod {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!match) throw new Error("Select a valid reporting month.");

  const year = Number(match[1]);
  const monthIndex = Number(match[2]);
  const finalDay = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();

  return {
    periodStart: `${month}-01`,
    periodEnd: `${month}-${String(finalDay).padStart(2, "0")}`,
  };
}
