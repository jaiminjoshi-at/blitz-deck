import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './constants';
import { UserProfile, UserProgress, LessonProgress, UserAnswer } from './content/types';

interface ProgressState extends UserProgress {
    startLesson: (lessonId: string, pathwayId?: string, unitId?: string) => void;
    updateProgress: (lessonId: string, questionIndex: number, currentScore: number, history: { questionId: string; isCorrect: boolean; userAnswer: UserAnswer }[], timeSpent: number, pathwayId?: string, unitId?: string) => void;
    completeLesson: (lessonId: string, score: number, timeTaken: number, pathwayId?: string, unitId?: string) => void;
    isLessonCompleted: (lessonId: string, pathwayId?: string, unitId?: string) => boolean;
    getLessonProgress: (lessonId: string, pathwayId?: string, unitId?: string) => LessonProgress | undefined;
    addProfile: (name: string, avatar: string) => void;
    selectProfile: (profileId: string) => void;
    updateActiveProfile: (updates: Partial<UserProfile>) => void;
    deleteProfile: (profileId: string) => void;
    resetLesson: (lessonId: string, pathwayId?: string, unitId?: string) => void;
    syncWithServer: () => Promise<void>;
    syncUserSession: (userId: string, name: string, avatar?: string) => void;
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
                if (!activeProfileId) {
                    return;
                }

                // Create key with unitId if available, otherwise fallback to pathwayId or just lessonId
                const key = (pathwayId && unitId)
                    ? `${activeProfileId}:${pathwayId}:${unitId}:${lessonId}`
                    : (pathwayId ? `${activeProfileId}:${pathwayId}:${lessonId}` : `${activeProfileId}:${lessonId}`);

                const genericKey = `${activeProfileId}:${lessonId}`;
                const current = lessonStatus[key];
                const generic = lessonStatus[genericKey];

                // If already completed, do not reset status to in-progress
                if (current?.status === 'completed') return;

                // Else, mark as in-progress (initializing if needed)
                if (current?.status !== 'in-progress') {

                    // If we have generic progress but no specific progress, inherit from generic
                    // This handles the "Resume on new device" case where sync only created generic key
                    const base = current || generic || {};

                    set((state) => ({
                        lessonStatus: {
                            ...state.lessonStatus,
                            [key]: {
                                ...base,
                                status: 'in-progress',
                                currentQuestionIndex: base.currentQuestionIndex || 0,
                                currentScore: base.currentScore || 0,
                                currentHistory: base.currentHistory || [],
                                currentTimeSpent: base.currentTimeSpent || 0
                            } as LessonProgress
                        }
                    }));
                }
            },

            updateProgress: (lessonId, questionIndex, currentScore, history, timeSpent, pathwayId, unitId) => {
                const { activeProfileId, lessonStatus } = get();
                if (!activeProfileId) {
                    return;
                }

                const key = (pathwayId && unitId)
                    ? `${activeProfileId}:${pathwayId}:${unitId}:${lessonId}`
                    : (pathwayId ? `${activeProfileId}:${pathwayId}:${lessonId}` : `${activeProfileId}:${lessonId}`);

                const current = lessonStatus[key];

                const updatedLesson = {
                    ...(current || { status: 'in-progress' }), // Ensure fallback if missing
                    currentQuestionIndex: questionIndex,
                    currentScore: currentScore,
                    currentHistory: history,
                    currentTimeSpent: timeSpent
                };

                set((state) => ({
                    lessonStatus: {
                        ...state.lessonStatus,
                        [key]: updatedLesson
                    }
                }));

                // Debounced Sync
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((window as any)._syncTimeout) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    clearTimeout((window as any)._syncTimeout);
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any)._syncTimeout = setTimeout(() => {
                    fetch('/api/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            lessonId,
                            score: currentScore, // This might be partial score
                            currentQuestionIndex: questionIndex,
                            currentHistory: history,
                            currentTimeSpent: timeSpent,
                            bestScore: current?.bestScore,
                            lastScore: current?.lastScore,
                            bestTime: current?.bestTime,
                            lastTime: current?.lastTime,
                            isCompleted: false
                        })
                    }).catch(() => { });
                }, 1000);
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

                // Post-update: Sync to DB
                fetch('/api/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lessonId,
                        score,
                        bestScore,
                        lastScore: score,
                        bestTime,
                        lastTime: timeTaken,
                        isCompleted: true
                    })
                }).catch(() => { });
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
                const generateId = () => {
                    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                        return crypto.randomUUID();
                    }
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

                const current = lessonStatus[key];

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
                        }
                    }
                }));
            },

            syncWithServer: async () => {
                // Fetch progress from DB on mount/login
                try {
                    const response = await fetch('/api/sync', { cache: 'no-store' });
                    if (!response.ok) return;
                    const dbProgress = await response.json();

                    if (Array.isArray(dbProgress)) {
                        const { activeProfileId } = get();
                        if (!activeProfileId) return;

                        set((state) => {
                            const newLessonStatus = { ...state.lessonStatus };
                            const existingKeys = Object.keys(newLessonStatus);

                            dbProgress.forEach((record: { lessonId: string; score: number; bestScore?: number; lastScore?: number; bestTime?: number; lastTime?: number; currentQuestionIndex?: number; currentHistory?: { questionId: string; isCorrect: boolean; userAnswer: UserAnswer }[]; currentTimeSpent?: number; completedAt?: string }) => {
                                const simpleKey = `${activeProfileId}:${record.lessonId}`;
                                const status = record.completedAt ? 'completed' : 'in-progress';

                                const updateData = {
                                    status: status as 'completed' | 'in-progress',
                                    currentQuestionIndex: record.currentQuestionIndex || 0,
                                    currentScore: record.lastScore ?? record.score,
                                    currentHistory: record.currentHistory || [],
                                    currentTimeSpent: record.currentTimeSpent || 0,
                                    bestScore: record.bestScore ?? record.score,
                                    lastScore: record.lastScore ?? record.score,
                                    bestTime: record.bestTime,
                                    lastTime: record.lastTime
                                } as LessonProgress;

                                // 1. Update/Create Simple Key
                                newLessonStatus[simpleKey] = {
                                    ...(newLessonStatus[simpleKey] || {}),
                                    ...updateData
                                };

                                // 2. Broadcast to ALL keys for this lesson/user (Shadow Update)
                                // This ensures that if the user has a composite key locally, it gets updated too.
                                existingKeys.forEach(k => {
                                    if (k.startsWith(`${activeProfileId}:`) && k.endsWith(`:${record.lessonId}`)) {
                                        newLessonStatus[k] = {
                                            ...newLessonStatus[k],
                                            ...updateData,
                                            // Preserve local status if it was completed locally but somehow not on server? 
                                            // Ideally server is source of truth.
                                            // But let's trust server for data.
                                        };
                                    }
                                });
                            });

                            return { lessonStatus: newLessonStatus };
                        });
                    }
                } catch (error) {
                    console.error('Failed to sync progress:', error);
                }
            },


            syncUserSession: (userId, name, avatar) => set((state) => {
                const existing = state.profiles.find(p => p.id === userId);
                if (existing) {
                    // Update if needed, and ensure active
                    return {
                        activeProfileId: userId,
                        profiles: state.profiles.map(p => p.id === userId ? { ...p, name, avatar: avatar || p.avatar } : p)
                    };
                }
                // Add new
                const newProfile: UserProfile = {
                    id: userId,
                    name,
                    avatar: avatar || '',
                    lastLoginDate: new Date().toISOString(),
                };
                return {
                    profiles: [...state.profiles, newProfile],
                    activeProfileId: userId
                };
            }),
        }),
        {
            name: STORAGE_KEYS.PROGRESS,
        }
    )
);

