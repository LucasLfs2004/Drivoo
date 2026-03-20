import { searchInstructors } from '../src/mock/instructors';
import { FiltrosBusca } from '../src/types/search';

describe('Instructor Search', () => {
  it('should return all instructors when no filters are applied', async () => {
    const filtros: FiltrosBusca = {};
    const resultado = await searchInstructors(filtros, 1, 10);

    expect(resultado.instrutores).toHaveLength(8);
    expect(resultado.total).toBe(8);
    expect(resultado.pagina).toBe(1);
    expect(resultado.temMais).toBe(false);
  });

  it('should filter instructors by gender', async () => {
    const filtros: FiltrosBusca = {
      generoInstrutor: 'feminino',
    };
    const resultado = await searchInstructors(filtros, 1, 10);

    expect(resultado.instrutores.length).toBeGreaterThan(0);
    resultado.instrutores.forEach((instrutor: any) => {
      expect(instrutor.genero).toBe('feminino');
    });
  });

  it('should filter instructors by vehicle type', async () => {
    const filtros: FiltrosBusca = {
      tipoVeiculo: 'automatico',
    };
    const resultado = await searchInstructors(filtros, 1, 10);

    expect(resultado.instrutores.length).toBeGreaterThan(0);
    resultado.instrutores.forEach((instrutor: any) => {
      expect(instrutor.veiculo.transmissao).toBe('automatico');
    });
  });

  it('should filter instructors by maximum price', async () => {
    const filtros: FiltrosBusca = {
      precoMaximo: 85,
    };
    const resultado = await searchInstructors(filtros, 1, 10);

    expect(resultado.instrutores.length).toBeGreaterThan(0);
    resultado.instrutores.forEach((instrutor: any) => {
      expect(instrutor.precos.valorHora).toBeLessThanOrEqual(85);
    });
  });

  it('should filter instructors by minimum rating', async () => {
    const filtros: FiltrosBusca = {
      avaliacaoMinima: 4.8,
    };
    const resultado = await searchInstructors(filtros, 1, 10);

    expect(resultado.instrutores.length).toBeGreaterThan(0);
    resultado.instrutores.forEach((instrutor: any) => {
      expect(instrutor.avaliacoes.media).toBeGreaterThanOrEqual(4.8);
    });
  });

  it('should filter instructors by location radius', async () => {
    const filtros: FiltrosBusca = {
      localizacao: {
        coordenadas: { latitude: -23.5505, longitude: -46.6333 },
        raio: 3,
      },
    };
    const resultado = await searchInstructors(filtros, 1, 10);

    expect(resultado.instrutores.length).toBeGreaterThan(0);
    resultado.instrutores.forEach((instrutor: any) => {
      expect(instrutor.localizacao.distancia).toBeLessThanOrEqual(3);
    });
  });

  it('should combine multiple filters correctly', async () => {
    const filtros: FiltrosBusca = {
      generoInstrutor: 'feminino',
      tipoVeiculo: 'automatico',
      precoMaximo: 100,
    };
    const resultado = await searchInstructors(filtros, 1, 10);

    resultado.instrutores.forEach((instrutor: any) => {
      expect(instrutor.genero).toBe('feminino');
      expect(instrutor.veiculo.transmissao).toBe('automatico');
      expect(instrutor.precos.valorHora).toBeLessThanOrEqual(100);
    });
  });

  it('should handle pagination correctly', async () => {
    const filtros: FiltrosBusca = {};
    const resultado = await searchInstructors(filtros, 1, 3);

    expect(resultado.instrutores).toHaveLength(3);
    expect(resultado.pagina).toBe(1);
    expect(resultado.totalPaginas).toBe(3); // 8 total / 3 per page = 3 pages
    expect(resultado.temMais).toBe(true);
  });

  it('should return empty results when no instructors match filters', async () => {
    const filtros: FiltrosBusca = {
      precoMaximo: 50, // Very low price that no instructor offers
    };
    const resultado = await searchInstructors(filtros, 1, 10);

    expect(resultado.instrutores).toHaveLength(0);
    expect(resultado.total).toBe(0);
    expect(resultado.temMais).toBe(false);
  });
});
