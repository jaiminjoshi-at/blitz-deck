'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Lesson, UserAnswer } from '@/lib/content/types';
import { useProgressStore } from '@/lib/store';

export function useQuiz(lesson: Lesson, pathwayId?: string, unitId?: string) {
    const startLesson = useProgressStore(s => s.startLesson);
    const completeLesson = useProgressStore(s => s.completeLesson);
    const updateProgress = useProgressStore(s => s.updateProgress);
    const resetLesson = useProgressStore(s => s.resetLesson);
    const activeProfileId = useProgressStore(s => s.activeProfileId);

    // Select saved progress specifically to avoid unnecessary re-renders
    const savedProgress = useProgressStore(s => s.getLessonProgress(lesson.id, pathwayId, unitId));

    // Initialize state from potential checkpoint
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

    // Ref to track if we are currently handling an answer transition
    const isTransitioning = useRef(false);

    // Initial mount effect

    useEffect(() => {
        // Delay hydration to avoid synchronous set state warning
        const t = setTimeout(() => setHydrated(true), 0);

        if (activeProfileId) {
            startLesson(lesson.id, pathwayId, unitId);
        }

        setSessionStartTime(Date.now());
        return () => clearTimeout(t);

    }, [lesson.id, pathwayId, unitId, startLesson, activeProfileId]); // added activeProfileId

    // REACTIVE SYNC: If store updates (e.g. from server sync), update local state if we are behind.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!savedProgress) return;

        // Skip update if we are in the middle of a local transition (showing feedback)
        if (isTransitioning.current) {
            return;
        }

        // If local index is 0 (fresh load) and remote is > 0, fast-forward.
        // OR if remote index > local index (progress made elsewhere), fast-forward.
        if ((savedProgress.currentQuestionIndex ?? 0) > currentQuestionIndex) {
            setCurrentQuestionIndex(savedProgress.currentQuestionIndex ?? 0);
            setScore(savedProgress.currentScore || 0);
            setHistory(savedProgress.currentHistory || []);
            setPrevTimeSpent(savedProgress.currentTimeSpent || 0);
        }
    }, [savedProgress, currentQuestionIndex]);

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

        const nextIndex = currentQuestionIndex + 1;

        // Mark transition start to block reactive sync
        isTransitioning.current = true;

        if (nextIndex < lesson.questions.length) {
            // Persist immediately so if user aborts during feedback, we resume at next question
            updateProgress(lesson.id, nextIndex, newScore, newHistory, totalTime, pathwayId, unitId);
        }

        setTimeout(() => {
            if (nextIndex < lesson.questions.length) {
                setCurrentQuestionIndex(nextIndex);
            } else {
                setShowResult(true);
            }
            // Transition complete
            isTransitioning.current = false;
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
