import type {
  InstructorVehicleApiResponse,
  MyInstructorVehiclesApiResponse,
} from '../types/api';
import type { InstructorVehicle } from '../types/domain';

const mapTransmissao = (
  tipoCambio?: InstructorVehicleApiResponse['tipo_cambio']
): 'manual' | 'automatico' => (tipoCambio === 'AUTOMATICO' ? 'automatico' : 'manual');

export const mapInstructorVehicle = (
  vehicle: InstructorVehicleApiResponse
): InstructorVehicle => ({
  id: vehicle.id,
  modelo: vehicle.modelo,
  ano: vehicle.ano ?? undefined,
  placa: vehicle.placa ?? undefined,
  transmissao: mapTransmissao(vehicle.tipo_cambio),
  aceitaVeiculoAluno: vehicle.aceita_veiculo_aluno ?? false,
  ativo: vehicle.ativo ?? true,
});

export const mapInstructorVehicles = (
  vehicles: MyInstructorVehiclesApiResponse
): InstructorVehicle[] => vehicles.map(mapInstructorVehicle);
