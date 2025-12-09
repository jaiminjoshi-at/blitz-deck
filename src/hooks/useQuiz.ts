'use client';
import { useState, useEffect, useCallback } from 'react';
import { Lesson } from '@/lib/content/types';
import { useProgressStore } from '@/lib/store';

export function useQuiz(lesson: Lesson) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const completeLesson = useProgressStore((state) => state.completeLesson);

    const handleAnswer = useCallback((isCorrect: boolean) => {
        if (isCorrect) {
            setScore((prev) => prev + 1);
        }

        setTimeout(() => {
            if (currentQuestionIndex < lesson.questions.length - 1) {
                setCurrentQuestionIndex((prev) => prev + 1);
            } else {
                setShowResult(true);
            }
        }, 1500);
    }, [currentQuestionIndex, lesson.questions.length]);

    useEffect(() => {
        if (showResult) {
            const isPassed = score === lesson.questions.length;
            if (isPassed) {
                completeLesson(lesson.id);
            }
        }
    }, [showResult, score, lesson.questions.length, lesson.id, completeLesson]);

    return {
        currentQuestionIndex,
        score,
        showResult,
        handleAnswer,
        totalQuestions: lesson.questions.length,
        currentQuestion: lesson.questions[currentQuestionIndex],
        isPassed: score === lesson.questions.length,
    };
}
