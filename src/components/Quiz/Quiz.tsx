'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { Lesson } from '@/lib/content/types';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import MatchingQuestion from './MatchingQuestion';
import Link from 'next/link';
import { useProgressStore } from '@/lib/store';

interface Props {
    lesson: Lesson;
    pathwayId?: string;
}

export default function Quiz({ lesson, pathwayId }: Props) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const [score, setScore] = React.useState(0);
    const [showResult, setShowResult] = React.useState(false);

    const currentQuestion = lesson.questions[currentQuestionIndex];

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            setScore(score + 1);
        }

        // Small delay before next question
        setTimeout(() => {
            if (currentQuestionIndex < lesson.questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                setShowResult(true);
            }
        }, 1500);
    };

    const completeLesson = useProgressStore((state) => state.completeLesson);

    React.useEffect(() => {
        if (showResult) {
            const isPassed = score === lesson.questions.length;
            if (isPassed) {
                completeLesson(lesson.id);
            }
        }
    }, [showResult, score, lesson.questions.length, lesson.id, completeLesson]);

    if (showResult) {
        const isPassed = score === lesson.questions.length;

        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    {isPassed ? 'Lesson Completed!' : 'Keep Practicing!'}
                </Typography>
                <Typography variant="h5">
                    You scored {score} out of {lesson.questions.length}
                </Typography>
                <Box sx={{ mt: 4 }}>
                    <Link href={pathwayId ? `/pathway/${pathwayId}` : "/"} passHref style={{ textDecoration: 'none' }}>
                        <Button variant="contained">{pathwayId ? "Back to Pathway" : "Back to Home"}</Button>
                    </Link>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
                Question {currentQuestionIndex + 1} of {lesson.questions.length}
            </Typography>

            {currentQuestion.type === 'multiple-choice' && (
                <MultipleChoiceQuestion
                    key={currentQuestion.id}
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                />
            )}

            {currentQuestion.type === 'matching' && (
                <MatchingQuestion
                    key={currentQuestion.id}
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                />
            )}
        </Paper>
    );
}
