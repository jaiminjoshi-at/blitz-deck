'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Link from 'next/link';
import { Lesson, ClozeQuestion as ClozeType, OrderingQuestion as OrderingType, MultipleResponseQuestion as MultipleResponseType, CategorizeQuestion as CategorizeType } from '@/lib/content/types';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import MatchingQuestion from './MatchingQuestion';
import ClozeQuestion from './ClozeQuestion';
import OrderingQuestion from './OrderingQuestion';
import MultipleResponseQuestion from './MultipleResponseQuestion';
import CategorizeQuestion from './CategorizeQuestion';
import FillInTheBlankQuestion from './FillInTheBlankQuestion';
import { useQuiz } from '@/hooks/useQuiz';

interface Props {
    lesson: Lesson;
    pathwayId?: string;
    unitId?: string;
}

export default function Quiz({ lesson, pathwayId, unitId }: Props) {
    const {
        currentQuestionIndex,
        currentQuestion,
        score,
        showResult,
        handleAnswer,
        totalQuestions,
        isPassed
    } = useQuiz(lesson, pathwayId, unitId);

    if (showResult) {
        return (
            <Paper sx={{
                p: 4,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                minHeight: '50vh' // Ensure it takes up some vertical space for a "full screen" feel
            }}>
                <Box>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        {isPassed ? 'Lesson Completed! 🎉' : 'Keep Practicing! 💪'}
                    </Typography>
                    <Typography variant="h5" color="text.secondary">
                        You scored {score} out of {totalQuestions}
                    </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Link href={pathwayId ? `/pathway/${pathwayId}` : "/"} passHref style={{ textDecoration: 'none' }}>
                        <Button
                            variant="contained"
                            size="large"
                            sx={{ minWidth: 200, py: 1.5, fontSize: '1.2rem' }}
                        >
                            {pathwayId ? "Back to Pathway" : "Back to Home"}
                        </Button>
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

            {currentQuestion.type === 'cloze' && (
                <ClozeQuestion
                    key={currentQuestion.id}
                    question={currentQuestion as ClozeType}
                    onAnswer={handleAnswer}
                />
            )}

            {currentQuestion.type === 'ordering' && (
                <OrderingQuestion
                    key={currentQuestion.id}
                    question={currentQuestion as OrderingType}
                    onAnswer={handleAnswer}
                />
            )}

            {currentQuestion.type === 'multiple-response' && (
                <MultipleResponseQuestion
                    key={currentQuestion.id}
                    question={currentQuestion as MultipleResponseType}
                    onAnswer={handleAnswer}
                />
            )}

            {currentQuestion.type === 'categorize' && (
                <CategorizeQuestion
                    key={currentQuestion.id}
                    question={currentQuestion as CategorizeType}
                    onAnswer={handleAnswer}
                />
            )}

            {currentQuestion.type === 'fill-in-the-blank' && (
                <FillInTheBlankQuestion
                    key={currentQuestion.id}
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                />
            )}
        </Paper>
    );
}
