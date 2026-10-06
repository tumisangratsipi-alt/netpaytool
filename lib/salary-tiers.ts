// The 20 salary tiers the /[salary]/[state] pages cover.
export const SALARY_TIERS = [
  30000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000,
  80000, 90000, 100000, 110000, 120000, 130000, 150000, 175000,
  200000, 250000, 300000,
];

/** The covered tier closest to a salary (ties go to the lower tier). */
export function nearestSalaryTier(salary: number): number {
  return SALARY_TIERS.reduce((best, tier) =>
    Math.abs(tier - salary) < Math.abs(best - salary) ? tier : best
  );
}
