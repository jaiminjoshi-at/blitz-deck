'use client';
import { useState, useEffect, useCallback } from 'react';
import { Lesson, UserAnswer } from '@/lib/content/types';
import { useProgressStore } from '@/lib/store';

export function useQuiz(lesson: Lesson, pathwayId?: string, unitId?: string) {
    const {
        startLesson,
        completeLesson,
        updateProgress,
        getLessonProgress,
        resetLesson,
        activeProfileId // Subscribe to profile
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

    // History and Time tracking
    const [history, setHistory] = useState<{ questionId: string; isCorrect: boolean; userAnswer: UserAnswer }[]>(savedProgress?.currentHistory || []);
    // Time spent in previous sessions (seconds)
    const [prevTimeSpent, setPrevTimeSpent] = useState(savedProgress?.currentTimeSpent || 0);
    // Session start time
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

    // Session duration in seconds (updated via effect)
    const [sessionDuration, setSessionDuration] = useState(0);

    // Initial mount effect
    // eslint-disable-next-line
    useEffect(() => {
        // Delay hydration to avoid synchronous set state warning
        const t = setTimeout(() => setHydrated(true), 0);

        if (activeProfileId) {
            startLesson(lesson.id, pathwayId, unitId);
        }

        setSessionStartTime(Date.now());
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lesson.id, pathwayId, unitId, startLesson, activeProfileId]); // added activeProfileId

    // Timer effect to update display time
    useEffect(() => {
        if (!sessionStartTime || showResult) return;

        const interval = setInterval(() => {
            setSessionDuration((Date.now() - sessionStartTime) / 1000);
        }, 1000);

        return () => clearInterval(interval);
    }, [sessionStartTime, showResult]);

    const handleAnswer = useCallback((isCorrect: boolean, userAnswer: UserAnswer) => {
        let newScore = score;
        if (isCorrect) {
            newScore = score + 1;
            setScore(newScore);
        }

        // Update history
        const currentQ = lesson.questions[currentQuestionIndex];
        const newHistory = [...history, { questionId: currentQ.id, isCorrect, userAnswer }];
        setHistory(newHistory);

        // Calculate time
        const now = Date.now();
        const duration = sessionStartTime ? (now - sessionStartTime) / 1000 : 0;
        const totalTime = prevTimeSpent + duration;

        setTimeout(() => {
            const nextIndex = currentQuestionIndex + 1;
            if (nextIndex < lesson.questions.length) {
                setCurrentQuestionIndex(nextIndex);
                // Persist both index, score, history, and time
                updateProgress(lesson.id, nextIndex, newScore, newHistory, totalTime, pathwayId, unitId);
            } else {
                setShowResult(true);
            }
        }, 1500);
    }, [currentQuestionIndex, lesson.questions, lesson.id, pathwayId, unitId, updateProgress, score, history, prevTimeSpent, sessionStartTime]);

    const retry = useCallback(() => {
        resetLesson(lesson.id, pathwayId, unitId);
        setCurrentQuestionIndex(0);
        setScore(0);
        setHistory([]);
        setPrevTimeSpent(0);
        setSessionDuration(0);
        setSessionStartTime(Date.now());
        setShowResult(false);
        // We need to restart to set status to in-progress
        startLesson(lesson.id, pathwayId, unitId);
    }, [lesson.id, pathwayId, unitId, resetLesson, startLesson]);

    useEffect(() => {
        if (showResult) {
            // Calculate final time
            const now = Date.now();
            const duration = sessionStartTime ? (now - sessionStartTime) / 1000 : 0;
            const totalTime = prevTimeSpent + duration;

            const percentage = Math.round((score / lesson.questions.length) * 100);
            completeLesson(lesson.id, percentage, totalTime, pathwayId, unitId);
        }
    }, [showResult, score, lesson.questions.length, lesson.id, pathwayId, unitId, completeLesson, prevTimeSpent, sessionStartTime]);

    if (!hydrated) return {
        currentQuestionIndex: 0,
        score: 0,
        showResult: false,
        handleAnswer: () => { },
        totalQuestions: lesson.questions.length,
        currentQuestion: lesson.questions[0],
        isPassed: false,
        history: [],
        timeTaken: 0,
        retry: () => { }
    };

    // Current total time for display
    const currentTotalTime = (prevTimeSpent || 0) + sessionDuration;

    return {
        currentQuestionIndex,
        score,
        showResult,
        handleAnswer,
        totalQuestions: lesson.questions.length,
        currentQuestion: lesson.questions[currentQuestionIndex],
        isPassed: score === lesson.questions.length,
        history,
        timeTaken: currentTotalTime,
        retry
    };
}
