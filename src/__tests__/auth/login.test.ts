import { authService } from '../../services/auth/authService';
import { AuthApiService } from '../../services/authApi';

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

describe('Login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve fazer login com sucesso', async () => {
        // Mock do fetch para simular resposta da API
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                data: {
                    usuario: {
                        id: '123',
                        email: 'aluno@teste.com',
                        telefone: '11999999999',
                        papel: 'aluno',
                        perfil: {
                            primeiroNome: 'João',
                            ultimoNome: 'Silva',
                            dataNascimento: '1990-01-01',
                            endereco: {
                                rua: 'Rua das Flores',
                                numero: '123',
                                bairro: 'Vila Madalena',
                                cidade: 'São Paulo',
                                estado: 'SP',
                                cep: '01234-567',
                                pais: 'BR'
                            },
                            cnh: {
                                categoria: 'B',
                                status: 'nenhuma'
                            },
                            preferencias: {
                                localizacao: { latitude: -23.5505, longitude: -46.6333 },
                                raio: 10
                            }
                        },
                        criadoEm: '2024-01-01',
                        atualizadoEm: '2024-01-01'
                    },
                    tokens: {
                        accessToken: 'mock-jwt-token',
                        refreshToken: 'mock-refresh-token',
                        expiresIn: 3600,
                        tokenType: 'Bearer'
                    }
                }
            }),
            status: 200
        });

        const credentials = {
            email: 'aluno@teste.com',
            password: 'senha123'
        };

        try {
            const result = await AuthApiService.login(credentials);
            expect(result).toBeDefined();
            expect(result).toHaveProperty('usuario');
            expect(result.usuario.email).toBe('aluno@teste.com');
            expect(result.usuario.papel).toBe('aluno');
        } catch (error) {
            console.error('Erro no teste:', error);
            throw error;
        }
    });

    test('deve falhar ao tentar login com credenciais inválidas', async () => {
        // Mock do fetch para simular erro 401
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: async () => ({
                success: false,
                message: 'Credenciais inválidas'
            })
        });

        const credentials = {
            email: 'email@invalido.com',
            password: 'senhaerrada'
        };

        try {
            await AuthApiService.login(credentials);
            fail('Deveria ter lançado um erro de credenciais inválidas');
        } catch (error) {
            expect(error.message).toBeDefined();
            expect(error.message).toContain('Credenciais');
        }
    });

    test('deve validar email obrigatório', async () => {
        const credentials = {
            email: '', // Email vazio
            password: 'senha123'
        };

        try {
            await AuthApiService.login(credentials);
            fail('Deveria ter lançado um erro de email obrigatório');
        } catch (error) {
            expect(error.message).toBeDefined();
        }
    });

    test('deve validar senha obrigatória', async () => {
        const credentials = {
            email: 'teste@teste.com',
            password: '' // Senha vazia
        };

        try {
            await AuthApiService.login(credentials);
            fail('Deveria ter lançado um erro de senha obrigatória');
        } catch (error) {
            expect(error.message).toBeDefined();
        }
    });

    test('deve validar formato de email', async () => {
        const credentials = {
            email: 'email-invalido', // Email sem formato
            password: 'senha123'
        };

        try {
            await AuthApiService.login(credentials);
            fail('Deveria ter lançado um erro de email inválido');
        } catch (error) {
            expect(error.message).toBeDefined();
        }
    });

    test('deve lidar com erro de rede', async () => {
        // Mock do fetch para simular erro de rede
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network Error'));

        const credentials = {
            email: 'teste@teste.com',
            password: 'senha123'
        };

        try {
            await AuthApiService.login(credentials);
            fail('Deveria ter lançado um erro de rede');
        } catch (error) {
            expect(error.message).toBeDefined();
            expect(error.message).toContain('rede');
        }
    });

    test('deve lidar com erro de servidor', async () => {
        // Mock do fetch para simular erro 500
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: async () => ({
                success: false,
                message: 'Erro interno do servidor'
            })
        });

        const credentials = {
            email: 'teste@teste.com',
            password: 'senha123'
        };

        try {
            await AuthApiService.login(credentials);
            fail('Deveria ter lançado um erro de servidor');
        } catch (error) {
            expect(error.message).toBeDefined();
            expect(error.message).toContain('servidor');
        }
    });

    test('deve lidar com timeout', async () => {
        // Mock do fetch para simular timeout
        global.fetch = jest.fn().mockRejectedValueOnce({
            code: 'ECONNABORTED',
            message: 'timeout of 30000ms exceeded'
        });

        const credentials = {
            email: 'teste@teste.com',
            password: 'senha123'
        };

        try {
            await AuthApiService.login(credentials);
            fail('Deveria ter lançado um erro de timeout');
        } catch (error) {
            expect(error.message).toBeDefined();
            expect(error.message).toContain('expirou');
        }
    });

    test('deve fazer login com diferentes tipos de usuário', async () => {
        // Teste para aluno
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                data: {
                    usuario: {
                        id: '123',
                        email: 'aluno@teste.com',
                        telefone: '11999999999',
                        papel: 'aluno',
                        perfil: {
                            primeiroNome: 'João',
                            ultimoNome: 'Silva',
                            dataNascimento: '1990-01-01',
                            endereco: {
                                rua: 'Rua das Flores',
                                numero: '123',
                                bairro: 'Vila Madalena',
                                cidade: 'São Paulo',
                                estado: 'SP',
                                cep: '01234-567',
                                pais: 'BR'
                            },
                            cnh: {
                                categoria: 'B',
                                status: 'nenhuma'
                            },
                            preferencias: {
                                localizacao: { latitude: -23.5505, longitude: -46.6333 },
                                raio: 10
                            }
                        },
                        criadoEm: '2024-01-01',
                        atualizadoEm: '2024-01-01'
                    },
                    tokens: {
                        accessToken: 'mock-jwt-token-aluno',
                        refreshToken: 'mock-refresh-token-aluno',
                        expiresIn: 3600,
                        tokenType: 'Bearer'
                    }
                }
            }),
            status: 200
        });

        const alunoCredentials = {
            email: 'aluno@teste.com',
            password: 'senha123'
        };

        try {
            const alunoResult = await AuthApiService.login(alunoCredentials);
            expect(alunoResult.usuario.papel).toBe('aluno');
        } catch (error) {
            console.error('Erro no teste de aluno:', error);
            throw error;
        }

        // Teste para instrutor
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                data: {
                    usuario: {
                        id: '456',
                        email: 'instrutor@teste.com',
                        telefone: '11988888888',
                        papel: 'instrutor',
                        perfil: {
                            primeiroNome: 'Carlos',
                            ultimoNome: 'Santos',
                            detranId: 'SP123456789',
                            licenca: {
                                numero: 'CNH987654321',
                                dataVencimento: '2026-12-31',
                                categorias: ['A', 'B']
                            },
                            veiculo: {
                                marca: 'Volkswagen',
                                modelo: 'Gol',
                                ano: 2020,
                                transmissao: 'manual',
                                placa: 'ABC-1234'
                            },
                            disponibilidade: {
                                segunda: { disponivel: true, horarios: [{ horaInicio: '08:00', horaFim: '18:00', disponivel: true }] },
                                terca: { disponivel: true, horarios: [{ horaInicio: '08:00', horaFim: '18:00', disponivel: true }] },
                                quarta: { disponivel: true, horarios: [{ horaInicio: '08:00', horaFim: '18:00', disponivel: true }] },
                                quinta: { disponivel: true, horarios: [{ horaInicio: '08:00', horaFim: '18:00', disponivel: true }] },
                                sexta: { disponivel: true, horarios: [{ horaInicio: '08:00', horaFim: '18:00', disponivel: true }] },
                                sabado: { disponivel: true, horarios: [{ horaInicio: '08:00', horaFim: '14:00', disponivel: true }] },
                                domingo: { disponivel: false, horarios: [] }
                            },
                            precos: {
                                valorHora: 80.00,
                                moeda: 'BRL'
                            },
                            localizacao: {
                                localizacaoBase: { latitude: -23.5505, longitude: -46.6333 },
                                raioAtendimento: 20
                            },
                            avaliacoes: {
                                media: 4.8,
                                quantidade: 127
                            }
                        },
                        criadoEm: '2023-08-10',
                        atualizadoEm: '2024-01-01'
                    },
                    tokens: {
                        accessToken: 'mock-jwt-token-instrutor',
                        refreshToken: 'mock-refresh-token-instrutor',
                        expiresIn: 3600,
                        tokenType: 'Bearer'
                    }
                }
            }),
            status: 200
        });

        const instrutorCredentials = {
            email: 'instrutor@teste.com',
            password: 'senha123'
        };

        try {
            const instrutorResult = await AuthApiService.login(instrutorCredentials);
            expect(instrutorResult.usuario.papel).toBe('instrutor');
        } catch (error) {
            console.error('Erro no teste de instrutor:', error);
            throw error;
        }
    });
});