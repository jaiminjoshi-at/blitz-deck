import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
    completedLessons: string[];
    completeLesson: (lessonId: string) => void;
    isLessonCompleted: (lessonId: string) => boolean;
}

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            completedLessons: [],
            completeLesson: (lessonId: string) => {
                const { completedLessons } = get();
                if (!completedLessons.includes(lessonId)) {
                    set({ completedLessons: [...completedLessons, lessonId] });
                }
            },
            isLessonCompleted: (lessonId: string) => {
                return get().completedLessons.includes(lessonId);
            },
        }),
        {
            name: 'lingo-pro-progress',
        }
    )
);
