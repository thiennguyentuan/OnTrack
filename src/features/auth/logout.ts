export async function logoutAndClear(input: {
  logout: () => Promise<void>;
  clearSession: () => void;
}): Promise<void> {
  await input.logout();
  input.clearSession();
}
