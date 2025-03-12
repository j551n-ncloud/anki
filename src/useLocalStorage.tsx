import { useState, useEffect } from 'react';

function useLocalStorage<T>(
    storageKey: string,
    fallbackState: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(storageKey);
            if (storedValue !== null) {
                return JSON.parse(storedValue); // Try parsing the stored value
            }
            return fallbackState; // Return fallback if not found
        } catch (error) {
            console.error(`Error parsing localStorage key "${storageKey}":`, error);
            return fallbackState; // Return fallback state in case of error
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(value)); // Set new value in localStorage
        } catch (error) {
            console.error(`Error setting localStorage key "${storageKey}":`, error);
        }
    }, [value, storageKey]);

    return [value, setValue];
}

export default useLocalStorage;
