import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Question } from '@/lib/content/types';

interface Props {
    question: Question;
    onAnswer: (isCorrect: boolean) => void;
}

export default function MultipleChoiceQuestion({ question, onAnswer }: Props) {
    const [value, setValue] = React.useState('');
    const [submitted, setSubmitted] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState(false);
    const [attempts, setAttempts] = React.useState(0);
    const [shuffledOptions, setShuffledOptions] = React.useState<string[]>([]);

    React.useEffect(() => {
        // Shuffle options when question changes
        const options = [...(question.options || [])];
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        setShuffledOptions(options);

        // Reset state for new question
        setValue('');
        setSubmitted(false);
        setIsCorrect(false);
        setAttempts(0);
    }, [question]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue((event.target as HTMLInputElement).value);
        setSubmitted(false);
    };

    const handleSubmit = () => {
        const correct = value === question.correctAnswer;
        setSubmitted(true);
        setIsCorrect(correct);

        if (correct) {
            onAnswer(true);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= 2) {
                // Failed twice - proceed with false
                // Small delay to let them see the error message if we want, 
                // but usually we want to show the correct answer then proceed.
                // The requirements say "Move ahead", but also maybe show correct answer?
                // The plan said: Show "Correct Answer: X", Call onAnswer(false).

                // We'll rely on the UI showing the error state here.
                // But we need to actually *trigger* the move.
                // Let's delay slighty so they see "Incorrect" then move? 
                // Or better, just show "Incorrect. Correct was X" and wait for user?
                // Request said "When correct answer is still not selected, move ahead."
                // Implies automatic.

                onAnswer(false);
            }
        }
    };

    const isFailed = attempts >= 2 && !isCorrect;

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>{question.prompt}</Typography>
            <Grid container spacing={2}>
                {shuffledOptions.map((option) => {
                    const isSelected = value === option;
                    const showCorrect = submitted && isCorrect && isSelected;
                    const showIncorrect = submitted && !isCorrect && isSelected;
                    // If failed, highlight the correct answer? Maybe later. 
                    // For now, simple selection state.

                    let borderColor = 'divider';
                    let bgcolor = 'background.paper';

                    if (isSelected) {
                        borderColor = 'primary.main';
                        bgcolor = 'action.selected';
                    }
                    if (showCorrect) {
                        borderColor = 'success.main';
                        bgcolor = 'success.light';
                    }
                    if (showIncorrect) {
                        borderColor = 'error.main';
                        bgcolor = 'error.light';
                    }

                    return (
                        <Grid size={{ xs: 12 }} key={option}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => {
                                    // Logic simplified: If the button is clickable (not disabled),
                                    // we simply set the value and clear submitted state.
                                    // The disabled prop below handles the prevention logic.
                                    setValue(option);
                                    setSubmitted(false);
                                }}
                                sx={{
                                    justifyContent: 'flex-start',
                                    textAlign: 'left',
                                    p: 1.5, // Reduced padding
                                    textTransform: 'none',
                                    borderColor: borderColor,
                                    bgcolor: bgcolor,
                                    borderWidth: isSelected ? 2 : 1,
                                    '&:hover': {
                                        borderColor: submitted ? borderColor : 'primary.main',
                                        bgcolor: submitted ? bgcolor : 'action.hover',
                                        borderWidth: 2
                                    }
                                }}
                                disabled={submitted && (isCorrect || isFailed)}
                            >
                                <Typography variant="body1" color="text.primary">{option}</Typography>
                            </Button>
                        </Grid>
                    );
                })}
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    size="large"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!value || (submitted && (isCorrect || isFailed))}
                    sx={{ minWidth: 120, py: 1 }}
                >
                    {submitted && isFailed ? 'Next' : (submitted && !isCorrect ? 'Try Again' : 'Check Answer')}
                </Button>
            </Box>

            {submitted && (
                <Box
                    sx={{ mt: 2, scrollMarginBottom: '20px' }}
                    ref={(ref: HTMLElement | null) => {
                        if (ref) {
                            ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }}
                >
                    <Typography
                        variant="h6"
                        color={isCorrect ? 'success.main' : 'error.main'}
                        align="center"
                    >
                        {isCorrect
                            ? 'Correct!'
                            : isFailed
                                ? `Incorrect. The correct answer was: ${question.correctAnswer}`
                                : 'Incorrect, try again.'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
