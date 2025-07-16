import { createContext } from "react";

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  logoutSuccess: false,
  setLogoutSuccess: () => {},
  isAuthenticated: false,
});
