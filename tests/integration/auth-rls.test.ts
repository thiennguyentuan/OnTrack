import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey = process.env.SUPABASE_ANON_KEY ?? '';

async function register(label: string) {
  if (!anonKey) throw new Error('SUPABASE_ANON_KEY is required for local integration tests');
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const email = `${label}-${crypto.randomUUID()}@ontrack.local`;
  const { data, error } = await client.auth.signUp({
    email,
    password: 'OnTrack-test-123!',
    options: { data: { full_name: label } },
  });
  if (error || !data.user) throw error ?? new Error('Registration returned no user');
  return { client, userId: data.user.id };
}

describe.skipIf(!anonKey)('identity RLS', () => {
  it('trigger-creates a profile and settings for a registered user', async () => {
    const { client, userId } = await register('User A');
    const profile = await client.from('profiles').select('id,email').eq('id', userId).single();
    const settings = await client.from('user_settings').select('user_id').eq('user_id', userId).single();
    expect(profile.error).toBeNull();
    expect(profile.data?.id).toBe(userId);
    expect(settings.data?.user_id).toBe(userId);
  });

  it('does not expose another user profile', async () => {
    const userA = await register('User A');
    const userB = await register('User B');
    const { data, error } = await userA.client.from('profiles').select('id').eq('id', userB.userId);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});
