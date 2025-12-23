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
        isPassed,
        history,
        timeTaken,
        retry
    } = useQuiz(lesson, pathwayId, unitId);

    const [isReviewing, setIsReviewing] = React.useState(false);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.round(seconds % 60);
        return `${m}m ${s}s`;
    };

    if (showResult) {
        if (isReviewing) {
            return (
                <Paper sx={{ p: 4 }}>
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" fontWeight="bold">
                            Lesson Review
                        </Typography>
                        <Button variant="outlined" onClick={() => setIsReviewing(false)}>
                            Back to Summary
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {lesson.questions.map((q, index) => {
                            const result = history.find(h => h.questionId === q.id);
                            const isCorrect = result?.isCorrect;

                            return (
                                <Paper key={q.id} variant="outlined" sx={{ p: 2, borderColor: isCorrect ? 'success.light' : 'error.light', borderLeftWidth: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                                        <Box sx={{ mt: 0.5 }}>
                                            {isCorrect ? (
                                                <Typography color="success.main" fontWeight="bold">✓ Correct</Typography>
                                            ) : (
                                                <Typography color="error.main" fontWeight="bold">✗ Incorrect</Typography>
                                            )}
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="medium">
                                                {index + 1}. {q.prompt}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ ml: 4, mb: 2, p: 1, bgcolor: isCorrect ? 'success.lighter' : 'error.lighter', borderRadius: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Correct Answer: <strong>{Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</strong>
                                        </Typography>
                                    </Box>

                                    {q.explanation && (
                                        <Box sx={{ ml: 4, p: 1.5, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', gap: 1 }}>
                                            <Typography variant="body2" color="text.primary">
                                                💡 <strong>Explanation:</strong> {q.explanation}
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            );
                        })}
                    </Box>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button variant="contained" size="large" onClick={retry}>
                            Retake Lesson
                        </Button>
                        <Link href={pathwayId ? `/pathway/${pathwayId}` : "/"} passHref style={{ textDecoration: 'none' }}>
                            <Button variant="outlined" size="large">
                                Back to Pathway
                            </Button>
                        </Link>
                    </Box>
                </Paper>
            );
        }

        return (
            <Paper sx={{
                p: 4,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                minHeight: '50vh'
            }}>
                <Box>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        {isPassed ? 'Lesson Completed! 🎉' : 'Keep Practicing! 💪'}
                    </Typography>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        You scored {score} out of {totalQuestions}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Time Taken: {formatTime(timeTaken || 0)}
                    </Typography>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 300 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => setIsReviewing(true)}
                        sx={{ py: 1.5, fontSize: '1.1rem' }}
                    >
                        Review Lesson
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        onClick={retry}
                        sx={{ py: 1.5, fontSize: '1.1rem' }}
                    >
                        Retake Lesson
                    </Button>

                    <Link href={pathwayId ? `/pathway/${pathwayId}` : "/"} passHref style={{ textDecoration: 'none', width: '100%' }}>
                        <Button
                            variant="outlined"
                            size="large"
                            fullWidth
                            sx={{ py: 1.5, fontSize: '1.1rem' }}
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
