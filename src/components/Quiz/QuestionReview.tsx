
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { Question } from '@/lib/content/types';

interface Props {
    question: Question;
    userResult: { isCorrect: boolean; userAnswer: any } | undefined;
    index: number;
}

export default function QuestionReview({ question, userResult, index }: Props) {
    const isCorrect = userResult?.isCorrect;
    const userAnswer = userResult?.userAnswer;

    // Helper to render specific answer comparison based on type
    const renderAnswerDetails = () => {
        if (!userAnswer && userAnswer !== 0 && userAnswer !== false) {
            return <Typography color="text.secondary" fontStyle="italic">No answer recorded.</Typography>;
        }

        switch (question.type) {
            case 'multiple-choice':
            case 'fill-in-the-blank':
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Your Answer:
                            <Typography component="span" fontWeight="bold" color={isCorrect ? 'success.main' : 'error.main'} sx={{ ml: 1 }}>
                                {String(userAnswer)}
                            </Typography>
                        </Typography>
                        {!isCorrect && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Correct Answer:
                                <Typography component="span" fontWeight="bold" color="success.main" sx={{ ml: 1 }}>
                                    {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(" or ") : question.correctAnswer}
                                </Typography>
                            </Typography>
                        )}
                    </Box>
                );
            case 'multiple-response':
                // userAnswer is string[]
                return (
                    <Box>
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Your Selections:</Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                {(userAnswer as string[]).map(opt => (
                                    <Chip
                                        key={opt}
                                        label={opt}
                                        size="small"
                                        color={question.correctAnswers?.includes(opt) ? "success" : "error"}
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Box>
                        {!isCorrect && (
                            <Box>
                                <Typography variant="body2" color="text.secondary">Correct Selections:</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                    {(question.correctAnswers || []).map(opt => (
                                        <Chip key={opt} label={opt} size="small" color="success" />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                );
            case 'matching':
                // userAnswer is Record<string, string> (Left -> Right)
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Your Matches:</Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            {Object.entries(userAnswer as Record<string, string>).map(([left, right]) => {
                                const isMatchCorrect = question.pairs?.[left] === right;
                                return (
                                    <Typography component="li" variant="body2" key={left} color={isMatchCorrect ? 'text.primary' : 'error.main'}>
                                        {left} ➔ {right} {!isMatchCorrect && `(Correct: ${question.pairs?.[left]})`}
                                    </Typography>
                                );
                            })}
                        </Box>
                    </Box>
                );
            case 'ordering':
                // userAnswer is string[] (IDs in order)
                // question.items has {id, text}
                const itemsMap = new Map((question.items || []).map(i => [i.id, i.text]));
                const correctOrder = question.correctOrder || [];

                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Your Order:</Typography>
                        <Box component="ol" sx={{ pl: 2, m: 0 }}>
                            {(userAnswer as string[]).map((id, idx) => {
                                const isPosCorrect = id === correctOrder[idx];
                                return (
                                    <Typography component="li" variant="body2" key={idx} color={isPosCorrect ? 'text.primary' : 'error.main'}>
                                        {itemsMap.get(id) || id}
                                    </Typography>
                                );
                            })}
                        </Box>
                        {!isCorrect && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>Correct Order:</Typography>
                                <Box component="ol" sx={{ pl: 2, m: 0 }}>
                                    {correctOrder.map((id, idx) => (
                                        <Typography component="li" variant="body2" key={idx} color="success.main">
                                            {itemsMap.get(id) || id}
                                        </Typography>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                );
            case 'categorize':
                // userAnswer is Record<itemId, categoryName>
                const catUserAnswer = userAnswer as Record<string, string>;
                const catItemsMap = new Map((question.items || []).map(i => [i.id, i.text]));

                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Your Categorization:</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {Object.entries(catUserAnswer).map(([itemId, category]) => {
                                const correctCat = question.correctMapping?.[itemId];
                                const isCatCorrect = category === correctCat;
                                return (
                                    <Typography variant="body2" key={itemId} color={isCatCorrect ? 'text.primary' : 'error.main'}>
                                        <strong>{category}:</strong> {catItemsMap.get(itemId)}
                                        {!isCatCorrect && <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>(Should be: {correctCat})</Typography>}
                                    </Typography>
                                );
                            })}
                        </Box>
                    </Box>
                )
            case 'cloze':
                // userAnswer is Record<segmentIndex, optionIndex> (Wait, props said we passed object from Map)
                // Actually in ClozeQuestion we did: const userAnswer = Object.fromEntries(placements);
                // keys are indices (strings), values are optionIndices (numbers)

                // We want to reconstruct the full sentence.
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Your Answer:</Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {question.segments?.map((seg, idx) => {
                                if (!seg.isBlank) return <span key={idx}>{seg.text} </span>;

                                const placedOptionIdx = (userAnswer as Record<string, number>)[String(idx)];
                                const text = placedOptionIdx !== undefined ? question.options?.[placedOptionIdx] : "___";
                                const isSegCorrect = text === seg.text;

                                return (
                                    <Typography
                                        key={idx}
                                        component="span"
                                        color={isSegCorrect ? 'success.dark' : 'error.main'}
                                        fontWeight="bold"
                                        sx={{ mx: 0.5, borderBottom: '1px solid', borderColor: 'currentColor' }}
                                    >
                                        {text}
                                    </Typography>
                                );
                            })}
                        </Typography>

                        {!isCorrect && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>Correct Sentence:</Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {question.segments?.map((seg, idx) => (
                                        <span key={idx}>{seg.text} </span>
                                    ))}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                );
            default:
                return <Typography variant="caption">Review not implemented for {question.type}</Typography>;
        }
    };

    return (
        <Box
            sx={{
                p: 2,
                borderLeft: 6,
                borderColor: isCorrect ? 'success.light' : 'error.light',
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: 1
            }}
        >
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ mt: 0.5 }}>
                    {isCorrect ? (
                        <Typography color="success.main" fontWeight="bold">✓</Typography>
                    ) : (
                        <Typography color="error.main" fontWeight="bold">✗</Typography>
                    )}
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                        {index + 1}. {question.prompt}
                    </Typography>

                    {/* Answer Details */}
                    <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                        {renderAnswerDetails()}
                    </Box>
                </Box>
            </Box>

            {question.explanation && (
                <Box sx={{ ml: 4, mt: 2, p: 1.5, bgcolor: 'info.lighter', borderRadius: 1, display: 'flex', gap: 1 }}>
                    <Typography variant="body2" color="text.primary">
                        💡 <strong>Explanation:</strong> {question.explanation}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
