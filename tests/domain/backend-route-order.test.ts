import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('FastAPI session routes', () => {
  it('declares the static history route before the UUID parameter route', () => {
    const source = readFileSync('backend/app/main.py', 'utf8');
    expect(source.indexOf("@app.get('/api/v3/sessions/history')"))
      .toBeLessThan(source.indexOf("@app.get('/api/v3/sessions/{session_id}')"));
  });
});
