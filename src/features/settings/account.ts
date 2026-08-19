export function toProfileUpdate(input: { fullName: string; timezone: string }) {
  return { full_name: input.fullName.trim(), timezone: input.timezone.trim() };
}
