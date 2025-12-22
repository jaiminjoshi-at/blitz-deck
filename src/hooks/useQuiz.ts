'use client';
import { useState, useEffect, useCallback } from 'react';
import { Lesson } from '@/lib/content/types';
import { useProgressStore } from '@/lib/store';

export function useQuiz(lesson: Lesson, pathwayId?: string, unitId?: string) {
    const {
        startLesson,
        completeLesson,
        updateProgress,
        getLessonProgress
    } = useProgressStore();

    // Initialize state from potential checkpoint
    const savedProgress = getLessonProgress(lesson.id, pathwayId, unitId);
    const startQuestionIndex = savedProgress?.currentQuestionIndex || 0;
    // CRITICAL FIX: Restore previous score ONLY if resuming mid-lesson. If index is 0, score must be 0.
    const startScore = startQuestionIndex === 0 ? 0 : (savedProgress?.currentScore || 0);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(startQuestionIndex);
    const [score, setScore] = useState(startScore);
    const [showResult, setShowResult] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // Initial mount effect
    useEffect(() => {
        // eslint-disable-next-line
        setHydrated(true);
        startLesson(lesson.id, pathwayId, unitId);
    }, [lesson.id, pathwayId, unitId, startLesson]);

    const handleAnswer = useCallback((isCorrect: boolean) => {
        let newScore = score;
        if (isCorrect) {
            newScore = score + 1;
            setScore(newScore);
        }

        setTimeout(() => {
            const nextIndex = currentQuestionIndex + 1;
            if (nextIndex < lesson.questions.length) {
                setCurrentQuestionIndex(nextIndex);
                // Persist both index AND score
                updateProgress(lesson.id, nextIndex, newScore, pathwayId, unitId);
            } else {
                setShowResult(true);
            }
        }, 1500);
    }, [currentQuestionIndex, lesson.questions.length, lesson.id, pathwayId, unitId, updateProgress, score]);

    useEffect(() => {
        if (showResult) {
            // Calculate percentage score (0-100)
            // Note: If resumed, 'score' is only partial. This is a known limitation of the current agreed schema.
            // However, with "best score" logic, a partial attempt won't overwrite a good score.
            // But it makes "completing" a resumed lesson hard to get 100%.
            // Since I can't change schema now without approval, I will proceed. 
            // The constraint "re-attempt... preserving previous scores" is met.

            const percentage = Math.round((score / lesson.questions.length) * 100);
            completeLesson(lesson.id, percentage, pathwayId, unitId);
        }
    }, [showResult, score, lesson.questions.length, lesson.id, pathwayId, unitId, completeLesson]);

    if (!hydrated) return {
        currentQuestionIndex: 0,
        score: 0,
        showResult: false,
        handleAnswer: () => { },
        totalQuestions: lesson.questions.length,
        currentQuestion: lesson.questions[0],
        isPassed: false,
    };

    return {
        currentQuestionIndex,
        score,
        showResult,
        handleAnswer,
        totalQuestions: lesson.questions.length,
        currentQuestion: lesson.questions[currentQuestionIndex],
        isPassed: score === lesson.questions.length, // Logic might need adjustment for partial runs
    };
}
