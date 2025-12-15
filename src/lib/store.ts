import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './constants';
import { UserProfile, UserProgress, LessonProgress } from './content/types';

interface ProgressState extends UserProgress {
    startLesson: (lessonId: string) => void;
    updateProgress: (lessonId: string, questionIndex: number) => void;
    completeLesson: (lessonId: string, score: number) => void;
    isLessonCompleted: (lessonId: string) => boolean;
    getLessonProgress: (lessonId: string) => LessonProgress | undefined;
    addProfile: (name: string, avatar: string) => void;
    selectProfile: (profileId: string) => void;
    updateActiveProfile: (updates: Partial<UserProfile>) => void;
    deleteProfile: (profileId: string) => void;
}

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            profiles: [],
            activeProfileId: null,
            lessonStatus: {},

            getLessonProgress: (lessonId) => {
                const { activeProfileId, lessonStatus } = get();
                if (!activeProfileId) return undefined;
                return lessonStatus[`${activeProfileId}:${lessonId}`];
            },

            startLesson: (lessonId) => {
                const { activeProfileId, lessonStatus } = get();
                if (!activeProfileId) return;

                const key = `${activeProfileId}:${lessonId}`;
                const current = lessonStatus[key];

                // If already completed, do not reset status to in-progress
                if (current?.status === 'completed') return;

                // Else, mark as in-progress (initializing if needed)
                if (current?.status !== 'in-progress') {
                    set((state) => ({
                        lessonStatus: {
                            ...state.lessonStatus,
                            [key]: {
                                ...current,
                                status: 'in-progress',
                                currentQuestionIndex: current?.currentQuestionIndex || 0
                            }
                        }
                    }));
                }
            },

            updateProgress: (lessonId, questionIndex) => {
                const { activeProfileId, lessonStatus } = get();
                if (!activeProfileId) return;

                const key = `${activeProfileId}:${lessonId}`;
                const current = lessonStatus[key];

                set((state) => ({
                    lessonStatus: {
                        ...state.lessonStatus,
                        [key]: {
                            ...(current || { status: 'in-progress' }), // Ensure fallback if missing
                            currentQuestionIndex: questionIndex
                        }
                    }
                }));
            },

            completeLesson: (lessonId, score) => {
                const { activeProfileId, lessonStatus, profiles } = get();
                if (!activeProfileId) return;

                const key = `${activeProfileId}:${lessonId}`;
                const current = lessonStatus[key];
                const activeProfile = profiles.find(p => p.id === activeProfileId);
                const today = new Date().toISOString().split('T')[0];

                const bestScore = Math.max(current?.bestScore || 0, score);

                set((state) => ({
                    lessonStatus: {
                        ...state.lessonStatus,
                        [key]: {
                            ...current,
                            status: 'completed',
                            lastScore: score,
                            bestScore: bestScore,
                            currentQuestionIndex: 0 // Reset for next fresh attempt
                        }
                    },
                    profiles: state.profiles.map(p => {
                        if (p.id !== activeProfileId) return p;

                        // Only streak/xp update logic if not already completed/checked today? 
                        // For simplicity, we award XP every completion for now, but streak only once per day.
                        // Ideally we check if 'completed' was already true to avoid double XP for same lesson?
                        // User prompt didn't specify XP logic details, keeping existing simple streak logic.

                        let newStreak = p.streak;
                        if (p.lastLoginDate !== today) {
                            const lastDate = new Date(p.lastLoginDate);
                            const diff = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                            if (diff === 1) newStreak += 1;
                            else if (diff > 1) newStreak = 1;
                            else if (p.streak === 0) newStreak = 1;
                        }

                        // Bonus XP logic could go here based on score

                        return {
                            ...p,
                            xp: p.xp + 10, // Base XP
                            streak: newStreak,
                            lastLoginDate: today
                        };
                    })
                }));
            },

            isLessonCompleted: (lessonId) => {
                const { activeProfileId, lessonStatus } = get();
                if (!activeProfileId) return false;
                const progress = lessonStatus[`${activeProfileId}:${lessonId}`];
                return progress?.status === 'completed';
            },

            addProfile: (name, avatar) => set((state) => {
                const newProfile: UserProfile = {
                    id: crypto.randomUUID(),
                    name,
                    avatar,
                    xp: 0,
                    streak: 0,
                    lastLoginDate: new Date().toISOString().split('T')[0]
                };
                return {
                    profiles: [...state.profiles, newProfile],
                    activeProfileId: newProfile.id
                };
            }),

            selectProfile: (profileId) => set({ activeProfileId: profileId }),

            updateActiveProfile: (updates) => set((state) => ({
                profiles: state.profiles.map(p =>
                    p.id === state.activeProfileId ? { ...p, ...updates } : p
                )
            })),

            deleteProfile: (profileId) => set((state) => ({
                profiles: state.profiles.filter(p => p.id !== profileId),
                activeProfileId: state.activeProfileId === profileId ? null : state.activeProfileId
            })),
        }),
        {
            name: STORAGE_KEYS.PROGRESS,
        }
    )
);
