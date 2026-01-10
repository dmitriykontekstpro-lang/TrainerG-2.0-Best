import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { UserProfile, Gender, MainGoal, ExperienceLevel, TrainingLocation, ActivityLevel, SleepDuration, NutritionPlan } from '../types';
import { calculateNutrition } from '../utils/calculations';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProfileEditorProps {
    profile: UserProfile | null;
    onSave: (p: UserProfile) => void;
}

const INJURY_OPTIONS = ['ШЕЯ', 'ПЛЕЧИ', 'СПИНА', 'ПОЯСНИЦА', 'КОЛЕНИ', 'ЗАПЯСТЬЯ'];
const CHRONIC_OPTIONS = ['СЕРДЦЕ/ДАВЛЕНИЕ', 'АСТМА', 'НЕТ ОГРАНИЧЕНИЙ'];

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile: initialProfile, onSave }) => {
    const [profile, setProfile] = useState<Partial<UserProfile>>(initialProfile || {
        gender: 'MALE',
        age: 30,
        weight: 75,
        height: 175,
        injuries: [],
        chronic: [],
        mainGoal: 'MUSCLE_GAIN',
        experience: 'AMATEUR',
        location: 'GYM',
        daysPerWeek: 3,
        sessionDuration: 60,
        activityLevel: 'MODERATE',
        sleepDuration: '7_8'
    });

    const [isGoalOpen, setIsGoalOpen] = useState(false);
    const [projectedNutrition, setProjectedNutrition] = useState<NutritionPlan | null>(null);

    // Calc on change
    useEffect(() => {
        // Only calc if we have basic bio
        if (profile.weight && profile.height && profile.age && profile.gender && profile.activityLevel && profile.mainGoal) {
            const res = calculateNutrition(profile as UserProfile);
            setProjectedNutrition(res);
        }
    }, [profile.weight, profile.height, profile.age, profile.gender, profile.activityLevel, profile.mainGoal]);

    const update = (key: keyof UserProfile, val: any) => {
        setProfile(p => ({ ...p, [key]: val }));
    };

    const toggleArray = (key: 'injuries' | 'chronic', val: string) => {
        setProfile(p => {
            const list = p[key] || [];
            if (val === 'НЕТ ОГРАНИЧЕНИЙ') return { ...p, [key]: [] };

            const exists = list.includes(val);
            const newList = exists ? list.filter(i => i !== val) : [...list, val];
            return { ...p, [key]: newList };
        });
    };

    const handleSave = () => {
        onSave(profile as UserProfile);
        Alert.alert("Успешно", "Данные профиля обновлены.");
    };

    const sectionTitle = (title: string) => (
        <Text className="text-gray-500 font-mono text-xs uppercase mt-6 mb-2">{title}</Text>
    );

    const getGoalLabel = (g?: string) => {
        switch (g) {
            case 'WEIGHT_LOSS': return 'ПОХУДЕНИЕ';
            case 'MUSCLE_GAIN': return 'НАБОР МАССЫ';
            case 'RECOMPOSITION': return 'РЕКОМПОЗИЦИЯ';
            case 'STRENGTH': return 'СИЛА';
            case 'ENDURANCE': return 'ВЫНОСЛИВОСТЬ';
            case 'MAINTENANCE': return 'ПОДДЕРЖАНИЕ';
            case 'CUTTING': return 'СУШКА';
            default: return 'ВЫБРАТЬ';
        }
    };

    const toggleGoalDropdown = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsGoalOpen(!isGoalOpen);
    };

    return (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
            <Text className="text-2xl font-bold text-white mb-6 uppercase">Профиль Атлета</Text>

            {/* CALCULATOR PREVIEW */}
            {projectedNutrition && (
                <View className="mb-6 bg-gray-900 border border-green-900/50 p-4 rounded-xl">
                    <Text className="text-flow-green font-mono text-xs uppercase mb-2 text-center">РАСЧЕТНАЯ НОРМА (Mifflin-St Jeor)</Text>
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-white font-bold text-3xl">{projectedNutrition.targetCalories}</Text>
                        <Text className="text-gray-400 text-xs">ККАЛ</Text>
                    </View>
                    <View className="flex-row gap-4">
                        <Text className="text-gray-400 text-xs">Б: <Text className="text-white font-bold">{projectedNutrition.protein}</Text></Text>
                        <Text className="text-gray-400 text-xs">Ж: <Text className="text-white font-bold">{projectedNutrition.fats}</Text></Text>
                        <Text className="text-gray-400 text-xs">У: <Text className="text-white font-bold">{projectedNutrition.carbs}</Text></Text>
                    </View>
                </View>
            )}

            {sectionTitle('БИОМЕТРИЯ')}
            <View className="flex-row gap-4 mb-2">
                {['MALE', 'FEMALE'].map(g => (
                    <TouchableOpacity
                        key={g}
                        onPress={() => update('gender', g)}
                        className={`flex-1 p-3 rounded border ${profile.gender === g ? 'bg-flow-green border-flow-green' : 'bg-gray-900 border-gray-700'}`}
                    >
                        <Text className={`text-center font-bold uppercase ${profile.gender === g ? 'text-black' : 'text-gray-400'}`}>
                            {g === 'MALE' ? 'Мужчина' : 'Женщина'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View className="flex-row gap-4">
                <View className="flex-1">
                    <Text className="text-gray-600 text-[10px] mb-1">ВОЗРАСТ</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={String(profile.age || '')}
                        onChangeText={t => update('age', parseInt(t) || 0)}
                        className="bg-gray-900 text-white p-3 rounded border border-gray-700"
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-600 text-[10px] mb-1">РОСТ (СМ)</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={String(profile.height || '')}
                        onChangeText={t => update('height', parseInt(t) || 0)}
                        className="bg-gray-900 text-white p-3 rounded border border-gray-700"
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-600 text-[10px] mb-1">ВЕС (КГ)</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={String(profile.weight || '')}
                        onChangeText={t => update('weight', parseInt(t) || 0)}
                        className="bg-gray-900 text-white p-3 rounded border border-gray-700"
                    />
                </View>
            </View>

            {sectionTitle('ЦЕЛЬ')}
            <View className="z-10">
                <TouchableOpacity
                    onPress={toggleGoalDropdown}
                    className="flex-row justify-between items-center p-4 bg-gray-900 border border-gray-700 rounded mb-2"
                >
                    <Text className="text-white font-bold uppercase">{getGoalLabel(profile.mainGoal)}</Text>
                    <Text className="text-flow-green">{isGoalOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {isGoalOpen && (
                    <View className="bg-gray-900 border border-gray-800 rounded mb-4 overflow-hidden">
                        {(['WEIGHT_LOSS', 'CUTTING', 'MAINTENANCE', 'MUSCLE_GAIN', 'RECOMPOSITION', 'STRENGTH', 'ENDURANCE'] as MainGoal[]).filter(g => g !== profile.mainGoal).map(g => (
                            <TouchableOpacity
                                key={g}
                                onPress={() => {
                                    update('mainGoal', g);
                                    toggleGoalDropdown();
                                }}
                                className="p-4 border-b border-gray-800 active:bg-gray-800"
                            >
                                <Text className="text-gray-300 font-bold uppercase text-xs">
                                    {getGoalLabel(g)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <View className="mt-2">
                <Text className="text-gray-600 text-[10px] mb-1">ЦЕЛЕВОЙ ВЕС (КГ)</Text>
                <TextInput
                    keyboardType="numeric"
                    value={String(profile.targetWeight || '')}
                    onChangeText={t => update('targetWeight', parseInt(t) || 0)}
                    className="bg-gray-900 text-white p-3 rounded border border-gray-700"
                />
            </View>

            {sectionTitle('ОПЫТ')}
            <View className="flex-row gap-2">
                {(['BEGINNER', 'AMATEUR', 'ADVANCED'] as ExperienceLevel[]).map(e => (
                    <TouchableOpacity
                        key={e}
                        onPress={() => update('experience', e)}
                        className={`flex-1 p-3 rounded border ${profile.experience === e ? 'bg-white border-white' : 'bg-gray-900 border-gray-700'}`}
                    >
                        <Text className={`text-center font-bold uppercase text-[10px] ${profile.experience === e ? 'text-black' : 'text-white'}`}>
                            {e}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {sectionTitle('ТРАВМЫ')}
            <View className="flex-row flex-wrap gap-2">
                {INJURY_OPTIONS.map(i => (
                    <TouchableOpacity
                        key={i}
                        onPress={() => toggleArray('injuries', i)}
                        className={`px-3 py-2 rounded-full border ${profile.injuries?.includes(i) ? 'bg-red-900 border-red-500' : 'bg-gray-900 border-gray-700'}`}
                    >
                        <Text className={`text-xs ${profile.injuries?.includes(i) ? 'text-white' : 'text-gray-500'}`}>{i}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {sectionTitle('ХРОНИЧЕСКИЕ')}
            <View className="flex-row flex-wrap gap-2">
                {CHRONIC_OPTIONS.map(c => {
                    const isSel = c === 'НЕТ ОГРАНИЧЕНИЙ' ? (!profile.chronic || profile.chronic.length === 0) : profile.chronic?.includes(c);
                    return (
                        <TouchableOpacity
                            key={c}
                            onPress={() => toggleArray('chronic', c)}
                            className={`px-3 py-2 rounded-full border ${isSel ? 'bg-yellow-700 border-yellow-500' : 'bg-gray-900 border-gray-700'}`}
                        >
                            <Text className={`text-xs ${isSel ? 'text-white' : 'text-gray-500'}`}>{c}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                onPress={handleSave}
                className="mt-10 bg-flow-green py-4 rounded items-center"
            >
                <Text className="text-black font-bold uppercase tracking-widest">СОХРАНИТЬ ПРОФИЛЬ</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};
