'use client';
import * as React from 'react';
import { MultipleResponseQuestion as MultipleResponseQuestionType } from '@/lib/content/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';

interface Props {
    question: MultipleResponseQuestionType;
    onAnswer: (isCorrect: boolean) => void;
}

export default function MultipleResponseQuestion({ question, onAnswer }: Props) {
    const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
    const [submitted, setSubmitted] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState(false);
    const [attempts, setAttempts] = React.useState(0);
    const [shuffledOptions, setShuffledOptions] = React.useState<string[]>([]);

    React.useEffect(() => {
        const options = [...(question.options || [])];
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        setShuffledOptions(options);
        setSelectedOptions([]);
        setSubmitted(false);
        setIsCorrect(false);
        setAttempts(0);
    }, [question]);

    const handleToggle = (option: string) => {
        if (submitted) return; // Prevent changes after submit
        const currentIndex = selectedOptions.indexOf(option);
        const newChecked = [...selectedOptions];

        if (currentIndex === -1) {
            newChecked.push(option);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedOptions(newChecked);
    };

    const handleSubmit = () => {
        // Compare sets
        const selectedSet = new Set(selectedOptions);
        const correctSet = new Set(question.correctAnswers);

        let correct = true;
        if (selectedSet.size !== correctSet.size) {
            correct = false;
        } else {
            for (const item of selectedSet) {
                if (!correctSet.has(item)) {
                    correct = false;
                    break;
                }
            }
        }

        setSubmitted(true);
        setIsCorrect(correct);

        if (correct) {
            onAnswer(true);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= 2) {
                onAnswer(false);
            }
        }
    };

    const isFailed = attempts >= 2 && !isCorrect;

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>{question.prompt}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>Select all that apply.</Typography>

            <Grid container spacing={1}>
                {shuffledOptions.map((option) => {
                    const isSelected = selectedOptions.indexOf(option) !== -1;
                    const isCorrectAnswer = question.correctAnswers.includes(option);

                    let bgcolor = 'background.paper';
                    let borderColor = 'divider';

                    if (submitted) {
                        if (isCorrectAnswer) {
                            if (isCorrect || isFailed) {
                                borderColor = 'success.main';
                                bgcolor = 'success.light';
                            } else if (isSelected) {
                                borderColor = 'success.main';
                                bgcolor = 'success.light';
                            }
                        } else if (isSelected && !isCorrectAnswer) {
                            borderColor = 'error.main';
                            bgcolor = 'error.light'; // Highlight incorrect selections
                        } else if (!isSelected && isCorrectAnswer && isFailed) {
                            // Reveal missed correct answer ONLY when failed
                            borderColor = 'secondary.main';
                        }
                    } else if (isSelected) {
                        borderColor = 'primary.main';
                        bgcolor = 'action.selected';
                    }

                    return (
                        <Grid size={{ xs: 12, sm: 6 }} key={option}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1,
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor,
                                    borderColor,
                                    borderWidth: isSelected || (submitted && isCorrectAnswer) ? 2 : 1,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: submitted ? bgcolor : 'action.hover'
                                    }
                                }}
                                onClick={() => handleToggle(option)}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={isSelected}
                                            disabled={submitted} // Disable checkbox input itself, but parent click handles interaction logic
                                        />
                                    }
                                    label={option}
                                    sx={{ width: '100%', m: 0, pointerEvents: 'none' }} // Form control label shouldn't capture click, parent Paper does
                                />
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    size="large"
                    variant="contained"
                    onClick={() => {
                        if (submitted && !isCorrect && !isFailed) {
                            // "Try Again" clicked - reset submitted state to allow editing
                            setSubmitted(false);
                        } else {
                            // "Check Answer" or "Next" clicked
                            handleSubmit();
                        }
                    }}
                    disabled={selectedOptions.length === 0 || (submitted && (isCorrect || isFailed))}
                    sx={{ minWidth: 120, py: 1 }}
                >
                    {submitted && isFailed ? 'Next' : (submitted && !isCorrect ? 'Try Again' : 'Check Answer')}
                </Button>
            </Box>

            {submitted && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography
                        variant="h6"
                        color={isCorrect ? 'success.main' : 'error.main'}
                    >
                        {isCorrect
                            ? 'Correct!'
                            : isFailed
                                ? 'Incorrect.'
                                : 'Incorrect, try again.'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
