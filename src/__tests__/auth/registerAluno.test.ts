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

describe('Registro de Aluno', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve registrar aluno com sucesso', async () => {
        // Mock do fetch para simular resposta da API
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                access_token: 'mock-jwt-token',
                refresh_token: 'mock-refresh-token',
                user: {
                    id: '123',
                    email: 'aluno@teste.com',
                    nome: 'João',
                    sobrenome: 'Silva',
                    papel: 'aluno'
                }
            }),
            status: 200
        });

        const alunoData = {
            email: 'aluno@teste.com',
            senha: 'senha123',
            nome: 'João',
            sobrenome: 'Silva',
            cpf: '12345678901',
            telefone: '11999999999',
            data_nascimento: '1990-01-01',
            cep: '01234-567',
            cidade: 'São Paulo',
            estado: 'SP'
        };

        try {
            const result = await AuthApiService.registerAluno(alunoData);
            expect(result).toBeDefined();
            expect(result).toHaveProperty('access_token');
        } catch (error) {
            console.error('Erro no teste:', error);
            throw error;
        }
    });

    test('deve falhar ao tentar registrar aluno com email inválido', async () => {
        const alunoData = {
            email: 'email-invalido',
            senha: 'senha123',
            nome: 'João',
            sobrenome: 'Silva',
            cpf: '12345678901',
            telefone: '11999999999',
            data_nascimento: '1990-01-01',
            cep: '01234-567',
            cidade: 'São Paulo',
            estado: 'SP'
        };

        try {
            await AuthApiService.registerAluno(alunoData);
            fail('Deveria ter lançado um erro');
        } catch (error) {
            expect(error.message).toBeDefined();
        }
    });

    test('deve validar CPF com 11 dígitos', async () => {
        const alunoData = {
            email: 'teste@teste.com',
            senha: 'senha123',
            nome: 'João',
            sobrenome: 'Silva',
            cpf: '123', // CPF inválido
            telefone: '11999999999',
            data_nascimento: '1990-01-01',
            cep: '01234-567',
            cidade: 'São Paulo',
            estado: 'SP'
        };

        try {
            await AuthApiService.registerAluno(alunoData);
            fail('Deveria ter lançado um erro de CPF inválido');
        } catch (error) {
            expect(error.message).toContain('CPF');
        }
    });

    test('deve validar senha com pelo menos 6 caracteres', async () => {
        const alunoData = {
            email: 'teste@teste.com',
            senha: '123', // Senha muito curta
            nome: 'João',
            sobrenome: 'Silva',
            cpf: '12345678901',
            telefone: '11999999999',
            data_nascimento: '1990-01-01',
            cep: '01234-567',
            cidade: 'São Paulo',
            estado: 'SP'
        };

        try {
            await AuthApiService.registerAluno(alunoData);
            fail('Deveria ter lançado um erro de senha curta');
        } catch (error) {
            expect(error.message).toContain('senha');
        }
    });

    test('deve validar telefone com formato correto', async () => {
        const alunoData = {
            email: 'teste@teste.com',
            senha: 'senha123',
            nome: 'João',
            sobrenome: 'Silva',
            cpf: '12345678901',
            telefone: '11', // Telefone muito curto
            data_nascimento: '1990-01-01',
            cep: '01234-567',
            cidade: 'São Paulo',
            estado: 'SP'
        };

        try {
            await AuthApiService.registerAluno(alunoData);
            fail('Deveria ter lançado um erro de telefone inválido');
        } catch (error) {
            expect(error.message).toContain('telefone');
        }
    });

    test('deve validar data de nascimento', async () => {
        const alunoData = {
            email: 'teste@teste.com',
            senha: 'senha123',
            nome: 'João',
            sobrenome: 'Silva',
            cpf: '12345678901',
            telefone: '11999999999',
            data_nascimento: 'data-invalida', // Data inválida
            cep: '01234-567',
            cidade: 'São Paulo',
            estado: 'SP'
        };

        try {
            await AuthApiService.registerAluno(alunoData);
            fail('Deveria ter lançado um erro de data inválida');
        } catch (error) {
            expect(error.message).toBeDefined();
        }
    });

    test('deve validar campos obrigatórios', async () => {
        const alunoData = {
            email: '', // Email vazio
            senha: 'senha123',
            nome: 'João',
            sobrenome: 'Silva',
            cpf: '12345678901',
            telefone: '11999999999',
            data_nascimento: '1990-01-01',
            cep: '01234-567',
            cidade: 'São Paulo',
            estado: 'SP'
        };

        try {
            await AuthApiService.registerAluno(alunoData);
            fail('Deveria ter lançado um erro de email vazio');
        } catch (error) {
            expect(error.message).toContain('email');
        }
    });
});