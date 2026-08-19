import { describe, expect, it } from 'vitest';
import { flowRoutes } from '../../src/features/navigation/flow';

describe('navigation flow routes', () => {
  it('maps planning entities to standalone diagram screens', () => {
    expect(flowRoutes.milestoneDetail('m-1')).toBe('/milestone/m-1');
    expect(flowRoutes.milestoneEdit('m-1')).toBe('/milestone/edit-milestone?milestoneId=m-1');
    expect(flowRoutes.taskCreate('m-1')).toBe('/task/create-task?milestoneId=m-1');
    expect(flowRoutes.taskEdit('t-1')).toBe('/task/edit-task?taskId=t-1');
  });

  it('maps dashboard and risk cards to their diagram screens', () => {
    // Progress is one of the five tab destinations in the flow diagram, not a pushed screen.
    expect(flowRoutes.progress()).toBe('/(tabs)/progress');
    expect(flowRoutes.risk('d-1')).toBe('/risk/d-1');
  });
});
