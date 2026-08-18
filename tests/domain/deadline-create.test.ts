import { describe, expect, it } from 'vitest';
import { toDeadlinePayload } from '../../src/features/plans/create-deadline';

describe('toDeadlinePayload', () => {
  it('converts the FE date field into the REST create payload', () => {
    expect(toDeadlinePayload({
      title: '  E2E UI Deadline  ', dueDateInput: '01/09/2026', description: '  Browser flow  ', priority: 'HIGH',
    })).toEqual({
      title: 'E2E UI Deadline', description: 'Browser flow', due_at: '2026-09-01T23:59:59.000Z', priority: 'HIGH',
    });
  });
});
