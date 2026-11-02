<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { PROBLEMS, REPO, splitTicket } from '#lib/kb/split';

  let { ticket }: { ticket: number } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{split.unique}</strong> reports in #{ticket} ({split.rows} rows in the export, {split.rows - split.unique} repeated) ·
  <strong>{split.problems.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.problems as p (p.problem)}
      <tr>
        <td><code>{p.problem}</code>{#if p.problem !== 'unplaced'}<br /><span class="what">{PROBLEMS[p.problem].what}</span>{/if}</td>
        <td>{p.reports}</td>
        <td>{p.tenants}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
        <td>
          {#if p.problem !== 'unplaced'}
            <a href="https://github.com/{REPO}/issues/{PROBLEMS[p.problem].issue}">{REPO}#{PROBLEMS[p.problem].issue}</a>
          {:else}none{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#each split.problems as p (p.problem)}
  {#if p.readAsShift}
    <p class="note">{p.readAsShift} of the <code>{p.problem}</code> reports read as a one-day move: counted under <code>{p.problem}</code>, where they're filed, and again as <code>shift</code>.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .what { color: var(--muted); font-size: 0.85em; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
