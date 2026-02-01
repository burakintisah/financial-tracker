/**
 * Authentication Types
 */

export interface IUser {
  id: string;
  email: string;
  name: string;
  google_id: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface IUserPayload {
  id: string;
  email: string;
  name: string;
}

export interface IGoogleTokenPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export interface IAuthResponse {
  success: boolean;
  user: IUser;
  token: string;
}

export interface ITokenValidation {
  valid: boolean;
  user?: IUserPayload;
  error?: string;
}
