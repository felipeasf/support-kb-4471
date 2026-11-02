// #4471 split by what each report shows, counted with the desk's own view (CauseTable): every report
// counts under the cause causes.ts files it by. Reports the desk read as a one-day move (desk-notes.json)
// show a different bug, so they also get their own problem; they stay counted where they're filed.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';

export const REPO = 'felipeasf/support-kb-4471';

export const PROBLEMS: Record<Problem, { what: string; issue: number }> = {
  parser: { what: 'shared parser reads day-first dates month first: day and month swap', issue: 1 },
  hint: { what: 'booking-v3 form hints MM/DD/YYYY to day-first tenants: people type month first', issue: 2 },
  shift: { what: 'date moves by one day (time zone), not a day/month swap', issue: 3 },
};

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: number;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // How many of these reports the desk read as a one-day move (footnoted, as on the #4471 page).
  readAsShift: number;
};

function row(problem: ProblemRow['problem'], rs: Report[], oneDayMove: readonly string[]): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs.length,
    tenants: new Set(rs.map((r) => r.tenant)).size,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    readAsShift: problem === 'shift' ? 0 : rs.filter((r) => oneDayMove.includes(r.id)).length,
  };
}

export function splitTicket(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { rows: number; unique: number; problems: ProblemRow[] } {
  const merged = reports.filter((r) => r.mergedInto === ticket);
  const unique = uniqueById(merged);
  const by = new Map<ProblemRow['problem'], Report[]>();
  for (const r of unique) {
    const p = causeOf(r, tenantOf(r)) ?? 'unplaced';
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const shifted = unique.filter((r) => oneDayMove.includes(r.id));
  const problems = [
    ...[...by.entries()].map(([problem, rs]) => row(problem, rs, oneDayMove)).sort((a, b) => b.reports - a.reports),
    ...(shifted.length ? [row('shift', shifted, oneDayMove)] : []),
  ];
  return { rows: merged.length, unique: unique.length, problems };
}
