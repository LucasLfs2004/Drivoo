import { apiClient } from '../../../core/api';
import type { Usuario, UserRole } from '../../../types/auth';
import type { UpdateCurrentUserProfilePayload } from '../types/domain';

interface ApiCurrentUser {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  tipo: string;
  telefone?: string | null;
  foto_url?: string | null;
}

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
      primeiroNome: apiUser.nome,
      ultimoNome: apiUser.sobrenome,
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
      primeiroNome: apiUser.nome,
      ultimoNome: apiUser.sobrenome,
      departamento: '',
      permissoes: [],
    };
  }

  return {
    primeiroNome: apiUser.nome,
    ultimoNome: apiUser.sobrenome,
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
  const papel = mapApiRoleToAppRole(apiUser.tipo);

  return {
    id: apiUser.id,
    email: apiUser.email,
    telefone: apiUser.telefone ?? previousUser?.telefone ?? '',
    papel,
    perfil:
      previousUser?.papel === papel
        ? {
            ...previousUser.perfil,
            primeiroNome: apiUser.nome,
            ultimoNome: apiUser.sobrenome,
          }
        : createBaseProfile(papel, apiUser),
    criadoEm: previousUser?.criadoEm ?? new Date(),
    atualizadoEm: new Date(),
  };
};

export const userProfileApi = {
  async getCurrentUser(): Promise<Usuario> {
    const response = await apiClient.get<ApiCurrentUser>('/auth/me');
    return mapApiUserToUsuario(response.data);
  },

  async updateCurrentUser(
    userId: string,
    data: UpdateCurrentUserProfilePayload
  ): Promise<Usuario> {
    const response = await apiClient.put<ApiCurrentUser>(`/usuarios/${userId}`, data);
    return mapApiUserToUsuario(response.data);
  },
};
