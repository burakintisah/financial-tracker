/**
 * Authentication Types
 */

export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface IAuthContext extends IAuthState {
  login: (credential: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
