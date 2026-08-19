import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync('backend/app/main.py', 'utf8');

describe('REST today dashboard', () => {
  it('selects the next actionable session instead of returning a hard-coded empty value', () => {
    expect(source).toMatch(/session\['status'\] in \('PLANNED', 'IN_PROGRESS', 'PAUSED'\)/);
    expect(source).toContain("'next_session': next_session");
  });

  it('selects a risk card from deadlines that need attention', () => {
    expect(source).toContain("computed['risk_level'] in ('AT_RISK', 'OVERDUE')");
    expect(source).toContain("'risk_card': risk_card");
  });

  it('derives risk from one shared helper so every endpoint agrees', () => {
    expect(source).toContain('def risk_for(');
    expect(source).toContain('def expected_progress_for(');
    // today(), the deadline list and the risk endpoint must all go through it
    expect(source.match(/risk_for\(/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
  });

  it('never trusts the stale deadlines.risk_level column when listing plans', () => {
    const listing = source.slice(source.indexOf("@app.get('/api/v3/deadlines')"));
    expect(listing.slice(0, 400)).toContain('with_derived_state(row, now)');
  });

  it('exposes a direct milestone detail endpoint for the standalone FE screen', () => {
    expect(source).toContain("@app.get('/api/v3/milestones/{milestone_id}')");
  });

  it('returns the task title with a session so the detail and review screens can name it', () => {
    expect(source).toContain('t.title as task_title');
  });
});
