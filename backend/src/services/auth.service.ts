/**
 * Authentication Service
 * Handles Google OAuth validation and user management
 */

import { OAuth2Client } from 'google-auth-library';
import { supabaseClient } from '../config/supabase';
import { IUser, IGoogleTokenPayload } from '../types/auth.types';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token and extract payload
 */
export const verifyGoogleToken = async (idToken: string): Promise<IGoogleTokenPayload | null> => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email || '',
      name: payload.name || '',
      picture: payload.picture,
      email_verified: payload.email_verified || false,
    };
  } catch (error) {
    console.error('[Auth Service] Google token verification failed:', error);
    return null;
  }
};

/**
 * Find user by Google ID
 */
export const findUserByGoogleId = async (googleId: string): Promise<IUser | null> => {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as IUser;
  } catch (error) {
    console.error('[Auth Service] Error finding user by Google ID:', error);
    return null;
  }
};

/**
 * Find user by ID
 */
export const findUserById = async (userId: string): Promise<IUser | null> => {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as IUser;
  } catch (error) {
    console.error('[Auth Service] Error finding user by ID:', error);
    return null;
  }
};

/**
 * Create a new user
 */
export const createUser = async (
  googleId: string,
  email: string,
  name: string,
  avatarUrl?: string
): Promise<IUser | null> => {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .insert({
        google_id: googleId,
        email,
        name,
        avatar_url: avatarUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('[Auth Service] Error creating user:', error);
      return null;
    }

    // Create default accounts for new user
    await createDefaultAccounts(data.id);

    return data as IUser;
  } catch (error) {
    console.error('[Auth Service] Error creating user:', error);
    return null;
  }
};

/**
 * Update existing user
 */
export const updateUser = async (
  userId: string,
  updates: Partial<Pick<IUser, 'name' | 'avatar_url'>>
): Promise<IUser | null> => {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Auth Service] Error updating user:', error);
      return null;
    }

    return data as IUser;
  } catch (error) {
    console.error('[Auth Service] Error updating user:', error);
    return null;
  }
};

/**
 * Create or update user from Google login
 */
export const createOrUpdateUser = async (
  googlePayload: IGoogleTokenPayload
): Promise<IUser | null> => {
  // Check if user already exists
  const existingUser = await findUserByGoogleId(googlePayload.sub);

  if (existingUser) {
    // Update name and avatar if changed
    if (
      existingUser.name !== googlePayload.name ||
      existingUser.avatar_url !== googlePayload.picture
    ) {
      return await updateUser(existingUser.id, {
        name: googlePayload.name,
        avatar_url: googlePayload.picture,
      });
    }
    return existingUser;
  }

  // Create new user
  return await createUser(
    googlePayload.sub,
    googlePayload.email,
    googlePayload.name,
    googlePayload.picture
  );
};

/**
 * Create default accounts for a new user
 */
const createDefaultAccounts = async (userId: string): Promise<void> => {
  const defaultAccounts = [
    { name: 'Yapikredi', type: 'bank', institution: 'Yapikredi' },
    { name: 'Anadolu Hayat', type: 'pension', institution: 'Anadolu Hayat Emeklilik' },
    { name: 'Garanti', type: 'bank', institution: 'Garanti BBVA' },
    { name: 'Midas', type: 'brokerage', institution: 'Midas' },
    { name: 'IBKR', type: 'brokerage', institution: 'Interactive Brokers' },
  ];

  try {
    await supabaseClient.from('accounts').insert(
      defaultAccounts.map((account) => ({
        ...account,
        user_id: userId,
      }))
    );
  } catch (error) {
    console.error('[Auth Service] Error creating default accounts:', error);
  }
};
