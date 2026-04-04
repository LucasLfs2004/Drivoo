import { apiClient } from '../../../core/api';
import type { Usuario, UserRole } from '../../../types/auth';
import type { UpdateCurrentUserProfilePayload } from '../types/domain';

interface ApiCurrentUser {
  id: string;
  email: string;
  nome?: string | null;
  sobrenome?: string | null;
  tipo?: string | null;
  telefone?: string | null;
  foto_url?: string | null;
}

interface ApiCurrentUserResponse {
  needs_onboarding?: boolean;
  profile_completed?: boolean;
  usuario?: ApiCurrentUser;
  instrutor?: {
    id: string;
    geocoding_sucesso?: boolean;
  } | null;
}

export interface CurrentUserState {
  user: Usuario | null;
  needsOnboarding: boolean;
  profileCompleted: boolean;
}

export const isApiCurrentUserComplete = (
  apiUser?: ApiCurrentUser | null
): boolean =>
  Boolean(
    apiUser?.id &&
      apiUser.email &&
      apiUser.nome &&
      apiUser.sobrenome &&
      apiUser.tipo
  );

const mapApiRoleToAppRole = (tipo?: string): UserRole => {
  if (tipo === 'instrutor' || tipo === 'admin' || tipo === 'aluno') {
    return tipo;
  }

  if (tipo === 'student') {
    return 'aluno';
  }

  if (tipo === 'instructor') {
    return 'instrutor';
  }

  return 'aluno';
};

const createBaseProfile = (
  papel: UserRole,
  apiUser: ApiCurrentUser
): Usuario['perfil'] => {
  if (papel === 'instrutor') {
    return {
      primeiroNome: apiUser.nome ?? '',
      ultimoNome: apiUser.sobrenome ?? '',
      detranId: '',
      licenca: {
        numero: '',
        dataVencimento: new Date(),
        categorias: ['B'],
      },
      veiculo: {
        marca: '',
        modelo: '',
        ano: new Date().getFullYear(),
        transmissao: 'manual',
        placa: '',
      },
      disponibilidade: {
        segunda: { disponivel: false, horarios: [] },
        terca: { disponivel: false, horarios: [] },
        quarta: { disponivel: false, horarios: [] },
        quinta: { disponivel: false, horarios: [] },
        sexta: { disponivel: false, horarios: [] },
        sabado: { disponivel: false, horarios: [] },
        domingo: { disponivel: false, horarios: [] },
      },
      precos: {
        valorHora: 0,
        moeda: 'BRL',
      },
      localizacao: {
        localizacaoBase: { latitude: 0, longitude: 0 },
        raioAtendimento: 0,
      },
      avaliacoes: {
        media: 0,
        quantidade: 0,
      },
    };
  }

  if (papel === 'admin') {
    return {
      primeiroNome: apiUser.nome ?? '',
      ultimoNome: apiUser.sobrenome ?? '',
      departamento: '',
      permissoes: [],
    };
  }

  return {
    primeiroNome: apiUser.nome ?? '',
    ultimoNome: apiUser.sobrenome ?? '',
    dataNascimento: new Date(),
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      pais: 'BR',
    },
    cnh: {
      categoria: 'B',
      status: 'nenhuma',
    },
    preferencias: {
      localizacao: { latitude: 0, longitude: 0 },
      raio: 10,
    },
  };
};

export const mapApiUserToUsuario = (
  apiUser: ApiCurrentUser,
  previousUser?: Usuario | null
): Usuario => {
  const papel = mapApiRoleToAppRole(apiUser.tipo ?? undefined);
  const nome = apiUser.nome ?? '';
  const sobrenome = apiUser.sobrenome ?? '';

  return {
    id: apiUser.id,
    email: apiUser.email,
    telefone: apiUser.telefone ?? previousUser?.telefone ?? '',
    papel,
    perfil:
      previousUser?.papel === papel
        ? {
            ...previousUser.perfil,
            primeiroNome: nome,
            ultimoNome: sobrenome,
          }
        : createBaseProfile(papel, {
            ...apiUser,
            nome,
            sobrenome,
          }),
    criadoEm: previousUser?.criadoEm ?? new Date(),
    atualizadoEm: new Date(),
  };
};

const extractApiCurrentUser = (
  payload: ApiCurrentUser | ApiCurrentUserResponse
): ApiCurrentUser => {
  if ('usuario' in payload && payload.usuario) {
    return payload.usuario;
  }

  return payload as ApiCurrentUser;
};

export const userProfileApi = {
  async getCurrentUserState(previousUser?: Usuario | null): Promise<CurrentUserState> {
    const response = await apiClient.get<ApiCurrentUserResponse>('/auth/me');
    const payload = response.data;
    const apiUser = payload.usuario ?? null;
    const user = isApiCurrentUserComplete(apiUser)
      ? mapApiUserToUsuario(apiUser as ApiCurrentUser, previousUser)
      : null;
    const inferredNeedsOnboarding =
      Boolean(payload.needs_onboarding) ||
      !Boolean(payload.profile_completed) ||
      !user;

    return {
      user,
      needsOnboarding: inferredNeedsOnboarding,
      profileCompleted: Boolean(payload.profile_completed) && Boolean(user),
    };
  },

  async getCurrentUser(previousUser?: Usuario | null): Promise<Usuario> {
    const currentUserState = await this.getCurrentUserState(previousUser);

    if (!currentUserState.user) {
      throw new Error('Usuário autenticado ainda não concluiu o onboarding');
    }

    return currentUserState.user;
  },

  async updateCurrentUser(
    userId: string,
    data: UpdateCurrentUserProfilePayload
  ): Promise<Usuario> {
    const response = await apiClient.put<ApiCurrentUser | ApiCurrentUserResponse>(
      `/usuarios/${userId}`,
      data
    );
    return mapApiUserToUsuario(extractApiCurrentUser(response.data));
  },
};
