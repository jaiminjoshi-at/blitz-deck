import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './constants';
import { UserProfile, UserProgress } from './content/types';

interface ProgressState extends UserProgress {
    completeLesson: (lessonId: string) => void;
    isLessonCompleted: (lessonId: string) => boolean;
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

            completeLesson: (lessonId) => {
                const { activeProfileId, profiles } = get();
                if (!activeProfileId) return;

                const today = new Date().toISOString().split('T')[0];

                set((state) => ({
                    lessonStatus: {
                        ...state.lessonStatus,
                        [`${activeProfileId}:${lessonId}`]: true
                    },
                    profiles: state.profiles.map(p => {
                        if (p.id !== activeProfileId) return p;

                        // Check streak logic
                        let newStreak = p.streak;
                        if (p.lastLoginDate !== today) {
                            const lastDate = new Date(p.lastLoginDate);
                            const diff = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                            if (diff === 1) newStreak += 1;
                            else if (diff > 1) newStreak = 1;
                            else if (p.streak === 0) newStreak = 1;
                        }

                        return {
                            ...p,
                            xp: p.xp + 10,
                            streak: newStreak,
                            lastLoginDate: today
                        };
                    })
                }));
            },

            isLessonCompleted: (lessonId) => {
                const { activeProfileId, lessonStatus } = get();
                if (!activeProfileId) return false;
                return !!lessonStatus[`${activeProfileId}:${lessonId}`];
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
