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
                        // Update profile stats (just lastLogin for now if needed, but really just save progress)
                        // No gamification logic needed anymore.
                        if (p.id === activeProfileId) {
                            return {
                                ...p,
                                lastLoginDate: today
                            };
                        }
                        return p;
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
                // Determine ID generation method
                const generateId = () => {
                    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                        return crypto.randomUUID();
                    }
                    // Fallback for non-secure contexts (http) where randomUUID is not available
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                };

                const newProfile: UserProfile = {
                    id: generateId(),
                    name,
                    avatar,
                    lastLoginDate: new Date().toISOString(),
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

