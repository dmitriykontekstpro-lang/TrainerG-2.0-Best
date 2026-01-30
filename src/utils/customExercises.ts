import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, MuscleGroup } from '../types';
import { EXERCISE_DB } from '../data';

const STORAGE_KEY = 'custom_exercises_v1';

export const loadCustomExercises = async (): Promise<Exercise[]> => {
    try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
            return JSON.parse(json);
        }
        return [];
    } catch (e) {
        console.error('Failed to load custom exercises', e);
        return [];
    }
};

export const saveCustomExercise = async (newEx: Exercise): Promise<Exercise[]> => {
    try {
        const current = await loadCustomExercises();
        const updated = [...current, newEx];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('Failed to save custom exercise', e);
        return [];
    }
};

export const deleteCustomExercise = async (id: string): Promise<Exercise[]> => {
    try {
        const current = await loadCustomExercises();
        const updated = current.filter(e => e.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('Failed to delete custom exercise', e);
        return [];
    }
};

export const getCombinedExerciseDB = (customExercises: Exercise[]): Record<MuscleGroup, Exercise[]> => {
    // Deep copy to avoid mutating original
    const db: Record<MuscleGroup, Exercise[]> = JSON.parse(JSON.stringify(EXERCISE_DB));

    customExercises.forEach(ex => {
        if (!db[ex.group]) {
            // Should not happen if types are strict, but safety first
            db[ex.group] = [];
        }
        db[ex.group].push(ex);
    });

    return db;
};
