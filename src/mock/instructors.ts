import { InstrutorDisponivel } from '../types/search';

// Mock data for instructors in São Paulo
export const mockInstructors: InstrutorDisponivel[] = [
  {
    id: '1',
    primeiroNome: 'Carlos',
    ultimoNome: 'Silva',
    avatar: undefined,
    avaliacoes: {
      media: 4.8,
      quantidade: 127,
    },
    precos: {
      valorHora: 85,
      moeda: 'BRL',
    },
    veiculo: {
      marca: 'Volkswagen',
      modelo: 'Gol',
      transmissao: 'manual',
    },
    localizacao: {
      distancia: 2.3,
      endereco: 'Vila Madalena, São Paulo',
      coordenadas: {
        latitude: -23.5505,
        longitude: -46.6333,
      },
    },
    disponibilidade: {
      proximoSlot: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      slotsDisponiveis: 8,
    },
    especialidades: ['Primeira Habilitação', 'Aulas Noturnas'],
    genero: 'masculino',
    categorias: ['B'],
  },
  {
    id: '2',
    primeiroNome: 'Ana',
    ultimoNome: 'Santos',
    avatar: undefined,
    avaliacoes: {
      media: 4.9,
      quantidade: 203,
    },
    precos: {
      valorHora: 95,
      moeda: 'BRL',
    },
    veiculo: {
      marca: 'Honda',
      modelo: 'Civic',
      transmissao: 'automatico',
    },
    localizacao: {
      distancia: 1.8,
      endereco: 'Pinheiros, São Paulo',
      coordenadas: {
        latitude: -23.5629,
        longitude: -46.6997,
      },
    },
    disponibilidade: {
      proximoSlot: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      slotsDisponiveis: 12,
    },
    especialidades: ['Primeira Habilitação', 'Câmbio Automático', 'Instrutora Mulher'],
    genero: 'feminino',
    categorias: ['B'],
  },
  {
    id: '3',
    primeiroNome: 'Roberto',
    ultimoNome: 'Oliveira',
    avatar: undefined,
    avaliacoes: {
      media: 4.7,
      quantidade: 89,
    },
    precos: {
      valorHora: 80,
      moeda: 'BRL',
    },
    veiculo: {
      marca: 'Fiat',
      modelo: 'Argo',
      transmissao: 'manual',
    },
    localizacao: {
      distancia: 3.1,
      endereco: 'Butantã, São Paulo',
      coordenadas: {
        latitude: -23.5732,
        longitude: -46.7286,
      },
    },
    disponibilidade: {
      proximoSlot: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      slotsDisponiveis: 6,
    },
    especialidades: ['Primeira Habilitação', 'Aulas Fins de Semana'],
    genero: 'masculino',
    categorias: ['B'],
  },
  {
    id: '4',
    primeiroNome: 'Mariana',
    ultimoNome: 'Costa',
    avatar: undefined,
    avaliacoes: {
      media: 4.9,
      quantidade: 156,
    },
    precos: {
      valorHora: 100,
      moeda: 'BRL',
    },
    veiculo: {
      marca: 'Toyota',
      modelo: 'Corolla',
      transmissao: 'automatico',
    },
    localizacao: {
      distancia: 4.2,
      endereco: 'Jardins, São Paulo',
      coordenadas: {
        latitude: -23.5613,
        longitude: -46.6565,
      },
    },
    disponibilidade: {
      proximoSlot: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      slotsDisponiveis: 15,
    },
    especialidades: ['Primeira Habilitação', 'Câmbio Automático', 'Instrutora Mulher', 'Aulas Executivas'],
    genero: 'feminino',
    categorias: ['B'],
  },
  {
    id: '5',
    primeiroNome: 'João',
    ultimoNome: 'Ferreira',
    avatar: undefined,
    avaliacoes: {
      media: 4.6,
      quantidade: 74,
    },
    precos: {
      valorHora: 75,
      moeda: 'BRL',
    },
    veiculo: {
      marca: 'Chevrolet',
      modelo: 'Onix',
      transmissao: 'manual',
    },
    localizacao: {
      distancia: 5.8,
      endereco: 'Lapa, São Paulo',
      coordenadas: {
        latitude: -23.5052,
        longitude: -46.7019,
      },
    },
    disponibilidade: {
      proximoSlot: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      slotsDisponiveis: 4,
    },
    especialidades: ['Primeira Habilitação', 'Preço Acessível'],
    genero: 'masculino',
    categorias: ['B'],
  },
  {
    id: '6',
    primeiroNome: 'Patricia',
    ultimoNome: 'Lima',
    avatar: undefined,
    avaliacoes: {
      media: 4.8,
      quantidade: 112,
    },
    precos: {
      valorHora: 90,
      moeda: 'BRL',
    },
    veiculo: {
      marca: 'Nissan',
      modelo: 'March',
      transmissao: 'automatico',
    },
    localizacao: {
      distancia: 2.7,
      endereco: 'Vila Olímpia, São Paulo',
      coordenadas: {
        latitude: -23.5955,
        longitude: -46.6856,
      },
    },
    disponibilidade: {
      proximoSlot: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      slotsDisponiveis: 10,
    },
    especialidades: ['Primeira Habilitação', 'Câmbio Automático', 'Instrutora Mulher', 'Aulas Noturnas'],
    genero: 'feminino',
    categorias: ['B'],
  },
  {
    id: '7',
    primeiroNome: 'Eduardo',
    ultimoNome: 'Almeida',
    avatar: undefined,
    avaliacoes: {
      media: 4.7,
      quantidade: 95,
    },
    precos: {
      valorHora: 85,
      moeda: 'BRL',
    },
    veiculo: {
      marca: 'Hyundai',
      modelo: 'HB20',
      transmissao: 'manual',
    },
    localizacao: {
      distancia: 6.2,
      endereco: 'Mooca, São Paulo',
      coordenadas: {
        latitude: -23.5505,
        longitude: -46.5996,
      },
    },
    disponibilidade: {
      proximoSlot: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      slotsDisponiveis: 7,
    },
    especialidades: ['Primeira Habilitação', 'Aulas Fins de Semana', 'Zona Leste'],
    genero: 'masculino',
    categorias: ['B'],
  },
  {
    id: '8',
    primeiroNome: 'Fernanda',
    ultimoNome: 'Rodrigues',
    avatar: undefined,
    avaliacoes: {
      media: 4.9,
      quantidade: 178,
    },
    precos: {
      valorHora: 105,
      moeda: 'BRL',
    },
    veiculo: {
      marca: 'Volkswagen',
      modelo: 'Polo',
      transmissao: 'automatico',
    },
    localizacao: {
      distancia: 3.5,
      endereco: 'Itaim Bibi, São Paulo',
      coordenadas: {
        latitude: -23.5751,
        longitude: -46.6755,
      },
    },
    disponibilidade: {
      proximoSlot: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      slotsDisponiveis: 18,
    },
    especialidades: ['Primeira Habilitação', 'Câmbio Automático', 'Instrutora Mulher', 'Aulas Executivas', 'Experiência Premium'],
    genero: 'feminino',
    categorias: ['B'],
  },
];

// Function to simulate API search with filters
export const searchInstructors = (
  filtros: any,
  pagina: number = 1,
  limite: number = 10
): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let resultados = [...mockInstructors];

      // Apply filters
      if (filtros.generoInstrutor) {
        resultados = resultados.filter(
          (instrutor) => instrutor.genero === filtros.generoInstrutor
        );
      }

      if (filtros.tipoVeiculo) {
        resultados = resultados.filter(
          (instrutor) => instrutor.veiculo.transmissao === filtros.tipoVeiculo
        );
      }

      if (filtros.precoMaximo) {
        resultados = resultados.filter(
          (instrutor) => instrutor.precos.valorHora <= filtros.precoMaximo
        );
      }

      if (filtros.avaliacaoMinima) {
        resultados = resultados.filter(
          (instrutor) => instrutor.avaliacoes.media >= filtros.avaliacaoMinima
        );
      }

      if (filtros.localizacao?.raio) {
        resultados = resultados.filter(
          (instrutor) => instrutor.localizacao.distancia <= filtros.localizacao.raio
        );
      }

      // Sort by distance by default
      resultados.sort((a, b) => a.localizacao.distancia - b.localizacao.distancia);

      // Pagination
      const inicio = (pagina - 1) * limite;
      const fim = inicio + limite;
      const instrutoresPaginados = resultados.slice(inicio, fim);

      const resultado = {
        instrutores: instrutoresPaginados,
        total: resultados.length,
        pagina,
        totalPaginas: Math.ceil(resultados.length / limite),
        temMais: fim < resultados.length,
      };

      resolve(resultado);
    }, 800); // Simulate network delay
  });
};