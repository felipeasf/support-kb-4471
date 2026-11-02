// #4471 split by what each report shows. causes.ts places a report by tenant and channel; a report
// the desk read as a one-day move (desk-notes.json) shows a different bug, so it gets its own problem.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';

export const REPO = 'felipeasf/support-kb-4471';

export const PROBLEMS: Record<Problem, { what: string; issue: number }> = {
  parser: { what: 'shared parser reads day-first dates month first: day and month swap', issue: 1 },
  hint: { what: 'booking-v3 form hints MM/DD/YYYY to day-first tenants: people type month first', issue: 2 },
  shift: { what: 'date moves by one day (time zone), not a day/month swap', issue: 3 },
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | null {
  return oneDayMove.includes(r.id) ? 'shift' : causeOf(r, t);
}

export type ProblemRow = { problem: Problem | 'unplaced'; reports: number; tenants: number; firstSeen: string; lastSeen: string };

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
    const p = problemOf(r, tenantOf(r), oneDayMove) ?? 'unplaced';
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const problems = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs.length, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports - a.reports);
  return { rows: merged.length, unique: unique.length, problems };
}
