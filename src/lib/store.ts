import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './constants';
import { UserProfile, UserProgress, LessonProgress } from './content/types';

interface ProgressState extends UserProgress {
    startLesson: (lessonId: string, pathwayId?: string, unitId?: string) => void;
    updateProgress: (lessonId: string, questionIndex: number, currentScore: number, history: { questionId: string; isCorrect: boolean }[], timeSpent: number, pathwayId?: string, unitId?: string) => void;
    completeLesson: (lessonId: string, score: number, timeTaken: number, pathwayId?: string, unitId?: string) => void;
    isLessonCompleted: (lessonId: string, pathwayId?: string, unitId?: string) => boolean;
    getLessonProgress: (lessonId: string, pathwayId?: string, unitId?: string) => LessonProgress | undefined;
    addProfile: (name: string, avatar: string) => void;
    selectProfile: (profileId: string) => void;
    updateActiveProfile: (updates: Partial<UserProfile>) => void;
    deleteProfile: (profileId: string) => void;
    resetLesson: (lessonId: string, pathwayId?: string, unitId?: string) => void;
    syncWithServer: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            profiles: [],
            activeProfileId: null,
            lessonStatus: {},

            getLessonProgress: (lessonId, pathwayId, unitId) => {
                const { activeProfileId, lessonStatus } = get();
                if (!activeProfileId) return undefined;

                const keys: string[] = [];
                if (pathwayId && unitId) keys.push(`${activeProfileId}:${pathwayId}:${unitId}:${lessonId}`);
                if (pathwayId) keys.push(`${activeProfileId}:${pathwayId}:${lessonId}`);
                keys.push(`${activeProfileId}:${lessonId}`);

                for (const key of keys) {
                    if (lessonStatus[key]) return lessonStatus[key];
                }
                return undefined;
            },

            startLesson: (lessonId, pathwayId, unitId) => {
                const { activeProfileId, lessonStatus } = get();
                if (!activeProfileId) return;

                // Create key with unitId if available, otherwise fallback to pathwayId or just lessonId
                const key = (pathwayId && unitId)
                    ? `${activeProfileId}:${pathwayId}:${unitId}:${lessonId}`
                    : (pathwayId ? `${activeProfileId}:${pathwayId}:${lessonId}` : `${activeProfileId}:${lessonId}`);

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
                                currentQuestionIndex: current?.currentQuestionIndex || 0,
                                currentScore: current?.currentScore || 0,
                                currentHistory: [],
                                currentTimeSpent: 0
                            }
                        }
                    }));
                }
            },

            updateProgress: (lessonId, questionIndex, currentScore, history, timeSpent, pathwayId, unitId) => {
                const { activeProfileId, lessonStatus } = get();
                if (!activeProfileId) return;

                const key = (pathwayId && unitId)
                    ? `${activeProfileId}:${pathwayId}:${unitId}:${lessonId}`
                    : (pathwayId ? `${activeProfileId}:${pathwayId}:${lessonId}` : `${activeProfileId}:${lessonId}`);

                const current = lessonStatus[key];

                set((state) => ({
                    lessonStatus: {
                        ...state.lessonStatus,
                        [key]: {
                            ...(current || { status: 'in-progress' }), // Ensure fallback if missing
                            currentQuestionIndex: questionIndex,
                            currentScore: currentScore,
                            currentHistory: history,
                            currentTimeSpent: timeSpent
                        }
                    }
                }));
            },

            completeLesson: (lessonId, score, timeTaken, pathwayId, unitId) => {
                const { activeProfileId, lessonStatus } = get();
                if (!activeProfileId) return;

                const key = (pathwayId && unitId)
                    ? `${activeProfileId}:${pathwayId}:${unitId}:${lessonId}`
                    : (pathwayId ? `${activeProfileId}:${pathwayId}:${lessonId}` : `${activeProfileId}:${lessonId}`);

                const current = lessonStatus[key];

                const today = new Date().toISOString().split('T')[0];

                const bestScore = Math.max(current?.bestScore || 0, score);

                // Calculate best time logic:
                let bestTime = current?.bestTime;
                if (score > (current?.bestScore || 0)) {
                    bestTime = timeTaken;
                } else if (score === (current?.bestScore || 0)) {
                    bestTime = Math.min(current?.bestTime || timeTaken, timeTaken);
                }

                set((state) => ({
                    lessonStatus: {
                        ...state.lessonStatus,
                        [key]: {
                            ...current,
                            status: 'completed',
                            lastScore: score,
                            bestScore: bestScore,
                            lastTime: timeTaken,
                            bestTime: bestTime,
                            currentQuestionIndex: 0, // Reset for next fresh attempt
                            currentHistory: [],
                            currentTimeSpent: 0
                        }
                    },
                    profiles: state.profiles.map(p => {
                        // Update profile stats
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

            isLessonCompleted: (lessonId, pathwayId, unitId) => {
                const { activeProfileId, lessonStatus } = get();
                if (!activeProfileId) return false;

                const keys: string[] = [];
                if (pathwayId && unitId) keys.push(`${activeProfileId}:${pathwayId}:${unitId}:${lessonId}`);
                if (pathwayId) keys.push(`${activeProfileId}:${pathwayId}:${lessonId}`);
                keys.push(`${activeProfileId}:${lessonId}`);

                for (const key of keys) {
                    if (lessonStatus[key]?.status === 'completed') return true;
                }
                return false;
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

            resetLesson: (lessonId, pathwayId, unitId) => {
                const { activeProfileId, lessonStatus } = get();
                if (!activeProfileId) return;

                const key = (pathwayId && unitId)
                    ? `${activeProfileId}:${pathwayId}:${unitId}:${lessonId}`
                    : (pathwayId ? `${activeProfileId}:${pathwayId}:${lessonId}` : `${activeProfileId}:${lessonId}`);

                // Keep bestScore/bestTime but reset current progress
                const current = lessonStatus[key];

                // CRITICAL FIX: Preserve 'completed' status to avoid losing the checkmark
                const newStatus = current?.status === 'completed' ? 'completed' : 'not-started';

                set((state) => ({
                    lessonStatus: {
                        ...state.lessonStatus,
                        [key]: {
                            ...current,
                            status: newStatus,
                            currentQuestionIndex: 0,
                            currentScore: 0,
                            currentHistory: [],
                            currentTimeSpent: 0
                            // keep bestScore, lastScore, bestTime, lastTime
                        }
                    }
                }));
            },

            syncWithServer: async () => {
                try {
                    const response = await fetch('/api/sync', { cache: 'no-store' });
                    if (!response.ok) return;
                    const serverData = await response.json();

                    if (serverData && (serverData.profiles || serverData.lessonStatus)) {
                        set((state) => ({
                            ...state,
                            ...serverData
                        }));
                    }
                } catch (error) {
                    console.error('Failed to sync with server:', error);
                }
            },
        }),
        {
            name: STORAGE_KEYS.PROGRESS,
        }
    )
);

