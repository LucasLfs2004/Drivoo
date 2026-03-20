import { AuthApiService } from '../../features/auth/api/authApiService';

// Mock do console.log para não poluir os logs
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
});

describe('Registro de Instrutor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve registrar instrutor com sucesso', async () => {
        // Mock do fetch para simular resposta da API
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                access_token: 'mock-jwt-token',
                refresh_token: 'mock-refresh-token',
                user: {
                    id: '456',
                    email: 'instrutor@teste.com',
                    nome: 'Carlos',
                    sobrenome: 'Santos',
                    papel: 'instrutor'
                },
                instrutor: {
                    id: 'instr-123',
                    valor_hora: 80.00
                }
            }),
            status: 200
        });

        const instrutorData = {
            email: 'instrutor@teste.com',
            senha: 'senha123',
            nome: 'Carlos',
            sobrenome: 'Santos',
            cpf: '98765432101',
            telefone: '11988888888',
            data_nascimento: '1985-03-20',
            genero: 'M' as const,
            cnh_numero: 'CNH123456789',
            cnh_categorias: ['A', 'B'],
            cnh_vencimento: '2026-12-31',
            experiencia_anos: 5,
            valor_hora: 80.00,
            bio: 'Instrutor experiente com 5 anos de experiência',
            tags: ['paciente', 'experiente'],
            endereco: {
                rua: 'Rua das Flores',
                numero: '123',
                bairro: 'Vila Madalena',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '05435000',
                pais: 'BR'
            },
            veiculo: {
                marca: 'Volkswagen',
                modelo: 'Gol',
                ano: 2020,
                placa: 'ABC-1234',
                tipo_cambio: 'MANUAL' as const
            }
        };

        try {
            const result = await AuthApiService.registerInstrutor(instrutorData);
            expect(result).toBeDefined();
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('instrutor');
            expect(result.instrutor.valor_hora).toBe(80.00);
        } catch (error: any) {
            console.error('Erro no teste:', error);
            throw error;
        }
    });

    test('deve validar CNH obrigatória', async () => {
        const instrutorData = {
            email: 'instrutor@teste.com',
            senha: 'senha123',
            nome: 'Carlos',
            sobrenome: 'Santos',
            cpf: '98765432101',
            telefone: '11988888888',
            data_nascimento: '1985-03-20',
            genero: 'M' as const,
            cnh_numero: '', // CNH vazia
            cnh_categorias: ['A', 'B'],
            cnh_vencimento: '2026-12-31',
            experiencia_anos: 5,
            valor_hora: 80.00,
            bio: 'Instrutor experiente',
            tags: ['paciente'],
            endereco: {
                rua: 'Rua das Flores',
                numero: '123',
                bairro: 'Vila Madalena',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '05435000',
                pais: 'BR'
            },
            veiculo: {
                marca: 'Volkswagen',
                modelo: 'Gol',
                ano: 2020,
                placa: 'ABC-1234',
                tipo_cambio: 'MANUAL' as const
            }
        };

        try {
            await AuthApiService.registerInstrutor(instrutorData);
            fail('Deveria ter lançado um erro de CNH obrigatória');
        } catch (error: any) {
            expect(error.message).toContain('CNH');
        }
    });

    test('deve validar categorias da CNH', async () => {
        const instrutorData = {
            email: 'instrutor@teste.com',
            senha: 'senha123',
            nome: 'Carlos',
            sobrenome: 'Santos',
            cpf: '98765432101',
            telefone: '11988888888',
            data_nascimento: '1985-03-20',
            genero: 'M' as const,
            cnh_numero: 'CNH123456789',
            cnh_categorias: [], // Categorias vazias
            cnh_vencimento: '2026-12-31',
            experiencia_anos: 5,
            valor_hora: 80.00,
            bio: 'Instrutor experiente',
            tags: ['paciente'],
            endereco: {
                rua: 'Rua das Flores',
                numero: '123',
                bairro: 'Vila Madalena',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '05435000',
                pais: 'BR'
            },
            veiculo: {
                marca: 'Volkswagen',
                modelo: 'Gol',
                ano: 2020,
                placa: 'ABC-1234',
                tipo_cambio: 'MANUAL' as const
            }
        };

        try {
            await AuthApiService.registerInstrutor(instrutorData);
            fail('Deveria ter lançado um erro de categorias da CNH');
        } catch (error: any) {
            expect(error.message).toContain('categoria');
        }
    });

    test('deve validar valor/hora maior que zero', async () => {
        const instrutorData = {
            email: 'instrutor@teste.com',
            senha: 'senha123',
            nome: 'Carlos',
            sobrenome: 'Santos',
            cpf: '98765432101',
            telefone: '11988888888',
            data_nascimento: '1985-03-20',
            genero: 'M' as const,
            cnh_numero: 'CNH123456789',
            cnh_categorias: ['A', 'B'],
            cnh_vencimento: '2026-12-31',
            experiencia_anos: 5,
            valor_hora: 0, // Valor/hora inválido
            bio: 'Instrutor experiente',
            tags: ['paciente'],
            endereco: {
                rua: 'Rua das Flores',
                numero: '123',
                bairro: 'Vila Madalena',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '05435000',
                pais: 'BR'
            },
            veiculo: {
                marca: 'Volkswagen',
                modelo: 'Gol',
                ano: 2020,
                placa: 'ABC-1234',
                tipo_cambio: 'MANUAL' as const
            }
        };

        try {
            await AuthApiService.registerInstrutor(instrutorData);
            fail('Deveria ter lançado um erro de valor/hora inválido');
        } catch (error: any) {
            expect(error.message).toContain('valor/hora');
        }
    });

    test('deve validar endereço obrigatório', async () => {
        const instrutorData = {
            email: 'instrutor@teste.com',
            senha: 'senha123',
            nome: 'Carlos',
            sobrenome: 'Santos',
            cpf: '98765432101',
            telefone: '11988888888',
            data_nascimento: '1985-03-20',
            genero: 'M' as const,
            cnh_numero: 'CNH123456789',
            cnh_categorias: ['A', 'B'],
            cnh_vencimento: '2026-12-31',
            experiencia_anos: 5,
            valor_hora: 80.00,
            bio: 'Instrutor experiente',
            tags: ['paciente'],
            endereco: null as any, // Endereço ausente
            veiculo: {
                marca: 'Volkswagen',
                modelo: 'Gol',
                ano: 2020,
                placa: 'ABC-1234',
                tipo_cambio: 'MANUAL' as const
            }
        };

        try {
            await AuthApiService.registerInstrutor(instrutorData);
            fail('Deveria ter lançado um erro de endereço obrigatório');
        } catch (error: any) {
            expect(error.message).toContain('endereço');
        }
    });

    test('deve validar veículo obrigatório', async () => {
        const instrutorData = {
            email: 'instrutor@teste.com',
            senha: 'senha123',
            nome: 'Carlos',
            sobrenome: 'Santos',
            cpf: '98765432101',
            telefone: '11988888888',
            data_nascimento: '1985-03-20',
            genero: 'M' as const,
            cnh_numero: 'CNH123456789',
            cnh_categorias: ['A', 'B'],
            cnh_vencimento: '2026-12-31',
            experiencia_anos: 5,
            valor_hora: 80.00,
            bio: 'Instrutor experiente',
            tags: ['paciente'],
            endereco: {
                rua: 'Rua das Flores',
                numero: '123',
                bairro: 'Vila Madalena',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '05435000',
                pais: 'BR'
            },
            veiculo: null as any // Veículo ausente
        };

        try {
            await AuthApiService.registerInstrutor(instrutorData);
            fail('Deveria ter lançado um erro de veículo obrigatório');
        } catch (error: any) {
            expect(error.message).toContain('veículo');
        }
    });

    test('deve validar número da CNH com formato correto', async () => {
        const instrutorData = {
            email: 'instrutor@teste.com',
            senha: 'senha123',
            nome: 'Carlos',
            sobrenome: 'Santos',
            cpf: '98765432101',
            telefone: '11988888888',
            data_nascimento: '1985-03-20',
            genero: 'M' as const,
            cnh_numero: '123', // CNH muito curta
            cnh_categorias: ['A', 'B'],
            cnh_vencimento: '2026-12-31',
            experiencia_anos: 5,
            valor_hora: 80.00,
            bio: 'Instrutor experiente',
            tags: ['paciente'],
            endereco: {
                rua: 'Rua das Flores',
                numero: '123',
                bairro: 'Vila Madalena',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '05435000',
                pais: 'BR'
            },
            veiculo: {
                marca: 'Volkswagen',
                modelo: 'Gol',
                ano: 2020,
                placa: 'ABC-1234',
                tipo_cambio: 'MANUAL' as const
            }
        };

        try {
            await AuthApiService.registerInstrutor(instrutorData);
            fail('Deveria ter lançado um erro de CNH inválida');
        } catch (error: any) {
            expect(error.message).toContain('CNH');
        }
    });
});
