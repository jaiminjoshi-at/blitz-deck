import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
    id: string;
    name: string;
    avatar: string;
    joinedAt: string;
    completedLessons: string[];
    xp: number;
    streak: number;
    lastLoginDate: string | null;
}

interface AppState {
    profiles: UserProfile[];
    activeProfileId: string | null;

    // Actions
    addProfile: (name: string, avatar: string) => void;
    selectProfile: (id: string) => void;
    updateActiveProfile: (updates: Partial<UserProfile>) => void;
    deleteProfile: (id: string) => void;

    // Progress Actions (proxied to active profile)
    completeLesson: (lessonId: string) => void;
    isLessonCompleted: (lessonId: string) => boolean;
}

export const useProgressStore = create<AppState>()(
    persist(
        (set, get) => ({
            profiles: [],
            activeProfileId: null,

            addProfile: (name, avatar) => {
                const newProfile: UserProfile = {
                    id: crypto.randomUUID(),
                    name,
                    avatar,
                    joinedAt: new Date().toISOString(),
                    completedLessons: [],
                    xp: 0,
                    streak: 0,
                    lastLoginDate: null,
                };
                set((state) => ({
                    profiles: [...state.profiles, newProfile],
                    activeProfileId: newProfile.id // Auto-select new profile
                }));
            },

            selectProfile: (id) => {
                set({ activeProfileId: id });
            },

            updateActiveProfile: (updates) => {
                const { profiles, activeProfileId } = get();
                if (!activeProfileId) return;

                const updatedProfiles = profiles.map((p) =>
                    p.id === activeProfileId ? { ...p, ...updates } : p
                );
                set({ profiles: updatedProfiles });
            },

            deleteProfile: (id) => {
                const { profiles, activeProfileId } = get();
                const updatedProfiles = profiles.filter(p => p.id !== id);
                // If we deleted the active profile, logout
                const newActiveId = activeProfileId === id ? null : activeProfileId;
                set({ profiles: updatedProfiles, activeProfileId: newActiveId });
            },

            completeLesson: (lessonId) => {
                const { profiles, activeProfileId } = get();
                if (!activeProfileId) return;

                const profile = profiles.find(p => p.id === activeProfileId);
                if (!profile) return;

                if (!profile.completedLessons.includes(lessonId)) {
                    // Update lesson, XP, etc.
                    const updatedProfile = {
                        ...profile,
                        completedLessons: [...profile.completedLessons, lessonId],
                        xp: profile.xp + 50 // Simple XP logic for now
                    };

                    const updatedProfiles = profiles.map((p) =>
                        p.id === activeProfileId ? updatedProfile : p
                    );
                    set({ profiles: updatedProfiles });
                }
            },

            isLessonCompleted: (lessonId) => {
                const { profiles, activeProfileId } = get();
                if (!activeProfileId) return false;
                const profile = profiles.find(p => p.id === activeProfileId);
                return profile ? profile.completedLessons.includes(lessonId) : false;
            }
        }),
        {
            name: 'lingo-pro-storage', // Retain new storage key to avoid conflicts with old schema
        }
    )
);
