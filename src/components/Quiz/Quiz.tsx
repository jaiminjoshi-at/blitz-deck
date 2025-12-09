'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Link from 'next/link';
import { Lesson } from '@/lib/content/types';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import MatchingQuestion from './MatchingQuestion';
import { useQuiz } from '@/hooks/useQuiz';

interface Props {
    lesson: Lesson;
    pathwayId?: string;
}

export default function Quiz({ lesson, pathwayId }: Props) {
    const {
        currentQuestionIndex,
        currentQuestion,
        score,
        showResult,
        handleAnswer,
        totalQuestions,
        isPassed
    } = useQuiz(lesson);

    if (showResult) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    {isPassed ? 'Lesson Completed!' : 'Keep Practicing!'}
                </Typography>
                <Typography variant="h5">
                    You scored {score} out of {totalQuestions}
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
