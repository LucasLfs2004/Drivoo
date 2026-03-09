/**
 * Debounce utility to prevent rapid function calls
 * Useful for avoiding multiple AsyncStorage writes on rapid clicks
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Creates a debounced version of a function that returns a Promise
 * Useful for async operations like AsyncStorage writes
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
    func: T,
    wait: number
): (...args: Parameters<T>) => Promise<void> {
    let timeout: NodeJS.Timeout | null = null;
    let lastPromise: Promise<void> = Promise.resolve();

    return function executedFunction(...args: Parameters<T>): Promise<void> {
        return new Promise((resolve) => {
            const later = async () => {
                timeout = null;
                try {
                    await func(...args);
                } catch (error) {
                    console.error('Debounced async function error:', error);
                }
                resolve();
            };

            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(later, wait);
        });
    };
}
