import { login, logout, register } from './api';

export const authService = {
  signIn: (email: string, password: string) => login({ email, password }),
  signUp: (email: string, password: string, fullName: string) => register({ email, password, fullName }),
  signOut: logout,
};
