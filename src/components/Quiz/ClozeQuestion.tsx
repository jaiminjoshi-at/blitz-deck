'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { ClozeQuestion as ClozeQuestionType } from '@/lib/content/types';

interface ClozeQuestionProps {
    question: ClozeQuestionType;
    onAnswer: (isCorrect: boolean, userAnswer: any) => void;
}

export default function ClozeQuestion({ question, onAnswer }: ClozeQuestionProps) {
    // ... state ...
    const [placements, setPlacements] = React.useState<Map<number, number>>(new Map());
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState(false);
    const [attempts, setAttempts] = React.useState(0);


    // Reset when question changes
    React.useEffect(() => {
        setPlacements(new Map());
        setIsSubmitted(false);
        setIsCorrect(false);
        setAttempts(0);
    }, [question]);

    const handleOptionClick = (optionIndex: number) => {
        // Unlock on retry if we are in "Try again" state
        if (isSubmitted) {
            setIsSubmitted(false);
        }

        // Find first empty blank
        const firstEmptySegmentIndex = question.segments.findIndex(
            (seg, idx) => seg.isBlank && !placements.has(idx)
        );

        if (firstEmptySegmentIndex !== -1) {
            const newPlacements = new Map(placements);
            newPlacements.set(firstEmptySegmentIndex, optionIndex);
            setPlacements(newPlacements);
        }
    };

    const handleSlotClick = (segmentIndex: number) => {
        // Unlock on retry
        if (isSubmitted) {
            setIsSubmitted(false);
        }

        if (placements.has(segmentIndex)) {
            const newPlacements = new Map(placements);
            newPlacements.delete(segmentIndex);
            setPlacements(newPlacements);
        }
    };

    const handleSubmit = () => {
        // Validation
        let allCorrect = true;

        question.segments.forEach((seg, idx) => {
            if (!seg.isBlank) return;

            const placedOptionIdx = placements.get(idx);
            if (placedOptionIdx === undefined) {
                allCorrect = false;
                return;
            }

            const placedWord = question.options[placedOptionIdx];
            // Compare placed word with correct text
            if (placedWord !== seg.text) {
                allCorrect = false;
            }
        });

        setIsCorrect(allCorrect);
        setIsSubmitted(true);

        const userAnswer = Object.fromEntries(placements); // Convert Map to object for storage

        if (allCorrect) {
            onAnswer(true, userAnswer);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= 2) {
                // Second failure
                onAnswer(false, userAnswer);
            }
        }
    };

    // Calculate derived state
    const placedOptionIndices = new Set(placements.values());
    const totalBlanks = question.segments.filter(s => s.isBlank).length;
    const filledBlanks = placements.size;
    const canSubmit = filledBlanks === totalBlanks;

    // Check if we hit max attempts
    const isFailed = attempts >= 2 && !isCorrect && isSubmitted;

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            {/* Sentence Area */}
            <Typography variant="h5" sx={{ mb: 4, lineHeight: 2 }}>
                {question.segments.map((segment, idx) => {
                    if (!segment.isBlank) {
                        return <span key={idx}>{segment.text} </span>;
                    }

                    const placedOptionIdx = placements.get(idx);
                    const filledText = placedOptionIdx !== undefined ? question.options[placedOptionIdx] : null;

                    // Determine color based on submission state
                    let color = 'primary.main';
                    let borderColor = 'primary.main';

                    if (isSubmitted && filledText) {
                        borderColor = filledText === segment.text ? 'success.main' : 'error.main';
                        color = filledText === segment.text ? 'success.dark' : 'error.dark';
                    }

                    return (
                        <Box
                            key={idx}
                            component="span"
                            onClick={() => handleSlotClick(idx)}
                            sx={{
                                display: 'inline-block',
                                minWidth: 80,
                                height: '1.5em',
                                borderBottom: '2px solid',
                                borderColor: filledText ? borderColor : 'text.disabled',
                                mx: 1,
                                px: 1,
                                textAlign: 'center',
                                cursor: isFailed ? 'default' : 'pointer', // Lock only if FAILED
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: (isSubmitted && !isFailed) ? 'transparent' : 'action.hover'
                                },
                                verticalAlign: 'baseline',
                                color: color,
                                fontWeight: filledText ? 'bold' : 'normal'
                            }}
                        >
                            {filledText}
                        </Box>
                    );
                })}
            </Typography>

            {/* Word Bank */}
            <Paper
                elevation={0}
                sx={{
                    card: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 3,
                    borderRadius: 3,
                    mb: 4,
                    minHeight: 100
                }}
            >
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    WORD BANK
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {question.options.map((option, idx) => {
                        const isUsed = placedOptionIndices.has(idx);
                        return (
                            <Chip
                                key={idx}
                                label={option}
                                onClick={() => !isUsed && handleOptionClick(idx)}
                                disabled={isUsed || isFailed} // Lock only if FAILED (or used)
                                color="primary"
                                variant={isUsed ? "outlined" : "filled"}
                                sx={{
                                    opacity: isUsed ? 0.3 : 1,
                                    fontSize: '1rem',
                                    py: 2.5,
                                    borderRadius: 2
                                }}
                            />
                        );
                    })}
                </Box>
            </Paper>

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {!isSubmitted ? (
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        sx={{ px: 5, borderRadius: 5 }}
                    >
                        Check Answer
                    </Button>
                ) : (
                    <Fade in>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isCorrect ? 'success.main' : 'error.main' }}>
                                {isCorrect ? <CheckRoundedIcon /> : null}
                                <Typography variant="h6">
                                    {isCorrect
                                        ? 'Correct!'
                                        : (isFailed ? 'Incorrect. Moving on...' : 'Incorrect. Try again.')}
                                </Typography>
                            </Box>

                            {!isCorrect && !isFailed && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setIsSubmitted(false)}
                                >
                                    Try Again
                                </Button>
                            )}
                        </Box>
                    </Fade>
                )}
            </Box>
        </Box>
    );
}
