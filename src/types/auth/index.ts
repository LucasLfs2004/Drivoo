// Auth type definitions

// Core user role types
export type UserRole = 'aluno' | 'instrutor' | 'admin';

// Supporting types
export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pais: 'BR';
}

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export interface AgendaSemanal {
  segunda: AgendaDia;
  terca: AgendaDia;
  quarta: AgendaDia;
  quinta: AgendaDia;
  sexta: AgendaDia;
  sabado: AgendaDia;
  domingo: AgendaDia;
}

export interface AgendaDia {
  disponivel: boolean;
  horarios: SlotTempo[];
}

export interface SlotTempo {
  horaInicio: string; // formato HH:mm
  horaFim: string;    // formato HH:mm
  disponivel: boolean;
}

// Profile interfaces
export interface PerfilAluno {
  primeiroNome: string;
  ultimoNome: string;
  dataNascimento: Date;
  endereco: Endereco;
  cnh: {
    categoria: 'A' | 'B' | 'AB';
    status: 'nenhuma' | 'teoria_aprovada' | 'pratica_pendente' | 'completa';
  };
  preferencias: {
    generoInstrutor?: 'masculino' | 'feminino';
    tipoVeiculo?: 'manual' | 'automatico';
    localizacao: Coordenadas;
    raio: number; // km
  };
}

export interface PerfilInstrutor {
  primeiroNome: string;
  ultimoNome: string;
  detranId: string;
  licenca: {
    numero: string;
    dataVencimento: Date;
    categorias: ('A' | 'B')[];
  };
  veiculo: {
    marca: string;
    modelo: string;
    ano: number;
    transmissao: 'manual' | 'automatico';
    placa: string;
  };
  disponibilidade: AgendaSemanal;
  precos: {
    valorHora: number;
    moeda: 'BRL';
  };
  localizacao: {
    localizacaoBase: Coordenadas;
    raioAtendimento: number; // km
  };
  avaliacoes: {
    media: number;
    quantidade: number;
  };
}

export interface PerfilAdmin {
  primeiroNome: string;
  ultimoNome: string;
  departamento: string;
  permissoes: string[];
}

// Main user interface
export interface Usuario {
  id: string;
  email: string;
  telefone: string;
  papel: UserRole;
  perfil: PerfilAluno | PerfilInstrutor | PerfilAdmin;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Authentication state management
export interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  carregando: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Authentication action types
export type AuthActionType =
  | 'AUTH_LOADING'
  | 'AUTH_SUCCESS'
  | 'AUTH_ERROR'
  | 'AUTH_LOGOUT'
  | 'AUTH_CLEAR_ERROR'
  | 'AUTH_UPDATE_PROFILE';

export interface AuthAction {
  type: AuthActionType;
  payload?: any;
}

// Login/Register form types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterDataBase {
  email: string;
  password: string;
  telefone: string;
  papel: UserRole;
}

export interface RegisterDataAluno extends RegisterDataBase {
  papel: 'aluno';
  perfil: Omit<PerfilAluno, 'preferencias'> & {
    preferencias?: Partial<PerfilAluno['preferencias']>;
  };
}

export interface RegisterDataInstrutor extends RegisterDataBase {
  papel: 'instrutor';
  perfil: PerfilInstrutor;
  documentos?: {
    licencaDetran?: string; // base64 or file path
    documentoVeiculo?: string; // base64 or file path
  };
}

export interface RegisterDataAdmin extends RegisterDataBase {
  papel: 'admin';
  perfil: PerfilAdmin;
}

export type RegisterData = RegisterDataAluno | RegisterDataInstrutor | RegisterDataAdmin;

// Password reset types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Token management types
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// API response types
export interface AuthResponse {
  success: boolean;
  data?: {
    usuario: Usuario;
    tokens: TokenData;
  };
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ProfileUpdateRequest {
  perfil: Partial<PerfilAluno | PerfilInstrutor | PerfilAdmin>;
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

export interface RegisterUser {
  userType: 'aluno' | 'instrutor';
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  cep: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  veiculo?: VehicleUser;
  // Campos do instrutor
  cnh_numero?: string;
  cnh_categorias?: string[];
  cnh_vencimento?: string;
  valor_hora?: number;
  bio?: string;
}


export interface VehicleUser {
  marca?: string;
  modelo: string;
  ano: number;
  placa: string;
  tipo_cambio: "MANUAL" | "AUTOMATICO"
}
