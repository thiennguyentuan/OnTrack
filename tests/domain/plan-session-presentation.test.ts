import { describe, expect, it } from 'vitest';
import { toPlanSessionView } from '../../src/features/sessions/plan-presentation';

describe('toPlanSessionView', () => {
  it('maps the linked task progress and title for the session planner', () => {
    expect(toPlanSessionView({ title: 'Design Dashboard', current_progress: 40 })).toEqual({ title: 'Design Dashboard', progress: 40 });
  });
});
