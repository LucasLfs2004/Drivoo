import type {
  PerfilAdmin,
  PerfilAluno,
  PerfilInstrutor,
  Usuario,
} from '../../../types/auth';

export interface UpdateCurrentUserProfilePayload {
  nome?: string;
  sobrenome?: string;
  telefone?: string;
  email?: string;
}

export interface ProfileMenuItem {
  icon: string;
  title: string;
  description?: string;
  onPress: () => void;
}

export interface SettingsSectionItem {
  title: string;
  description?: string;
}

export type ProfileUser = Usuario;
export type StudentProfile = PerfilAluno;
export type InstructorProfile = PerfilInstrutor;
export type AdminProfile = PerfilAdmin;
