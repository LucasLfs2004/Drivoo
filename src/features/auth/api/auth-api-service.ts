import { SecureStorageService } from '../../../core/storage';
import { supabaseAuth } from '../../../core/auth/supabaseClient';
import type { ForgotPasswordRequest, LoginCredentials } from '../../../types/auth';

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email?: string | null;
  };
}

const normalizeSession = (session: {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
  user: {
    id: string;
    email?: string | null;
  };
} | null): SupabaseSession => {
  if (!session) {
    throw new Error(
      'Sessão do Supabase não retornada. Verifique se o signup exige confirmação por email.'
    );
  }

  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: session.token_type,
    expires_in: session.expires_in ?? 3600,
    user: {
      id: session.user.id,
      email: session.user.email,
    },
  };
};

const getSupabaseMessage = (error: { message?: string } | null): string => {
  if (!error?.message) {
    return 'Erro de autenticação no Supabase.';
  }

  return error.message;
};

const getSignUpFailureMessage = (params: {
  hasUser: boolean;
  hasSession: boolean;
  errorMessage?: string | null;
}): string => {
  if (params.errorMessage) {
    return params.errorMessage;
  }

  if (params.hasUser && !params.hasSession) {
    return 'Conta criada no Supabase, mas o projeto está exigindo confirmação de email antes de liberar a sessão. Desative a confirmação de email no Supabase ou confirme o email antes de continuar.';
  }

  return 'Erro de autenticação no Supabase.';
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const maskEmail = (email?: string | null): string => {
  if (!email) {
    return '(sem email)';
  }

  const [localPart, domain] = email.split('@');
  if (!domain) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? '*'}***@${domain}`;
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
};

export class AuthApiService {
  static async refreshToken(): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
  }> {
    const refreshToken = await SecureStorageService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }

    const { data, error } = await supabaseAuth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new Error(error?.message === 'Invalid Refresh Token: Already Used' ? 'REFRESH_TOKEN_EXPIRED' : getSupabaseMessage(error));
    }

    const session = normalizeSession(data.session);
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in,
      tokenType: 'Bearer',
    };
  }

  static async login(credentials: LoginCredentials): Promise<SupabaseSession> {
    const normalizedEmail = normalizeEmail(credentials.email);

    console.log('[AuthApiService.login] Iniciando login no Supabase', {
      email: maskEmail(normalizedEmail),
    });

    const { data, error } = await supabaseAuth.signInWithPassword({
      email: normalizedEmail,
      password: credentials.password,
    });

    if (error || !data.session) {
      console.log('[AuthApiService.login] Falha no login do Supabase', {
        email: maskEmail(normalizedEmail),
        errorMessage: error?.message ?? null,
        hasSession: Boolean(data.session),
        hasUser: Boolean(data.user),
      });
      throw new Error(getSupabaseMessage(error));
    }

    console.log('[AuthApiService.login] Login Supabase concluido', {
      email: maskEmail(data.user?.email ?? normalizedEmail),
      userId: data.user?.id ?? null,
      expiresIn: data.session.expires_in ?? null,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });
    console.log('[AuthApiService.login] accessToken raw', data.session.access_token);
    console.log('[AuthApiService.login] refreshToken raw', data.session.refresh_token);

    return normalizeSession(data.session);
  }

  static async signUp(email: string, password: string): Promise<SupabaseSession> {
    const normalizedEmail = normalizeEmail(email);

    console.log('[AuthApiService.signUp] Iniciando cadastro no Supabase', {
      email: maskEmail(normalizedEmail),
    });

    const { data, error } = await supabaseAuth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error || !data.session) {
      const failureMessage = getSignUpFailureMessage({
        errorMessage: error?.message ?? null,
        hasSession: Boolean(data.session),
        hasUser: Boolean(data.user),
      });

      console.log('[AuthApiService.signUp] Falha no cadastro do Supabase', {
        email: maskEmail(normalizedEmail),
        errorMessage: error?.message ?? null,
        interpretedMessage: failureMessage,
        hasSession: Boolean(data.session),
        hasUser: Boolean(data.user),
      });
      throw new Error(failureMessage);
    }

    console.log('[AuthApiService.signUp] Cadastro Supabase concluido', {
      email: maskEmail(data.user?.email ?? normalizedEmail),
      userId: data.user?.id ?? null,
      expiresIn: data.session.expires_in ?? null,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });
    console.log('[AuthApiService.signUp] accessToken raw', data.session.access_token);
    console.log('[AuthApiService.signUp] refreshToken raw', data.session.refresh_token);

    return normalizeSession(data.session);
  }

  static async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    const { error } = await supabaseAuth.resetPasswordForEmail(request.email);

    if (error) {
      throw new Error(getSupabaseMessage(error));
    }
  }

  static async logout(): Promise<void> {
    const { error } = await supabaseAuth.signOut();

    if (error) {
      throw new Error(getSupabaseMessage(error));
    }
  }
}
