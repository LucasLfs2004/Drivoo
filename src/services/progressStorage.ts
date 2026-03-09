import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const STORAGE_KEYS = {
    CATEGORY_A_LESSONS: '@drivoo:progress:categoryA',
    CATEGORY_B_LESSONS: '@drivoo:progress:categoryB',
};

const MAX_LESSONS = 20;

interface StoredProgress {
    completedLessons: number;
    lastUpdated: string;
}

export interface ProgressData {
    categoryA: number;
    categoryB: number;
}

/**
 * Valida se o número de aulas é válido
 */
function validateLessonCount(value: number): { valid: boolean; error?: string } {
    if (!Number.isInteger(value)) {
        return { valid: false, error: 'O número de aulas deve ser um número inteiro' };
    }

    if (value < 0) {
        return { valid: false, error: 'O número de aulas não pode ser negativo' };
    }

    if (value > MAX_LESSONS) {
        return { valid: false, error: `O número máximo de aulas é ${MAX_LESSONS}` };
    }

    return { valid: true };
}

/**
 * Carrega o progresso de ambas as categorias do AsyncStorage
 */
export async function loadProgress(): Promise<ProgressData> {
    try {
        const [categoryAData, categoryBData] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_A_LESSONS),
            AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_B_LESSONS),
        ]);

        let categoryA = 0;
        let categoryB = 0;

        // Parse e valida categoria A
        if (categoryAData) {
            try {
                const parsed: StoredProgress = JSON.parse(categoryAData);
                const validation = validateLessonCount(parsed.completedLessons);
                if (validation.valid) {
                    categoryA = parsed.completedLessons;
                }
            } catch (parseError) {
                console.error('Failed to parse categoryA data:', parseError);
            }
        }

        // Parse e valida categoria B
        if (categoryBData) {
            try {
                const parsed: StoredProgress = JSON.parse(categoryBData);
                const validation = validateLessonCount(parsed.completedLessons);
                if (validation.valid) {
                    categoryB = parsed.completedLessons;
                }
            } catch (parseError) {
                console.error('Failed to parse categoryB data:', parseError);
            }
        }

        return { categoryA, categoryB };
    } catch (error) {
        console.error('Failed to load progress:', error);
        // Retorna valores padrão em caso de erro
        return { categoryA: 0, categoryB: 0 };
    }
}

/**
 * Salva o progresso de uma categoria específica
 */
export async function saveProgress(category: 'A' | 'B', lessons: number): Promise<void> {
    // Valida antes de salvar
    const validation = validateLessonCount(lessons);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    try {
        const key = category === 'A'
            ? STORAGE_KEYS.CATEGORY_A_LESSONS
            : STORAGE_KEYS.CATEGORY_B_LESSONS;

        const data: StoredProgress = {
            completedLessons: lessons,
            lastUpdated: new Date().toISOString(),
        };

        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save progress:', error);

        Alert.alert(
            'Erro ao Salvar',
            'Não foi possível salvar seu progresso. Por favor, tente novamente.',
            [{ text: 'OK' }]
        );

        throw error;
    }
}

/**
 * Limpa todo o progresso armazenado
 */
export async function clearProgress(): Promise<void> {
    try {
        await Promise.all([
            AsyncStorage.removeItem(STORAGE_KEYS.CATEGORY_A_LESSONS),
            AsyncStorage.removeItem(STORAGE_KEYS.CATEGORY_B_LESSONS),
        ]);
    } catch (error) {
        console.error('Failed to clear progress:', error);
        throw error;
    }
}
