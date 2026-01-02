import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Question, UserAnswer } from '@/lib/content/types';

interface Props {
    question: Question;
    onAnswer: (isCorrect: boolean, userAnswer: UserAnswer) => void;
}

export default function FillInTheBlankQuestion({ question, onAnswer }: Props) {
    const [value, setValue] = React.useState('');
    const [submitted, setSubmitted] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState(false);
    const [attempts, setAttempts] = React.useState(0);

    // Reset state when question changes
    React.useEffect(() => {
        setValue('');
        setSubmitted(false);
        setIsCorrect(false);
        setAttempts(0);
    }, [question]);

    const normalize = (text: string) => text.trim().toLowerCase();

    const handleSubmit = () => {
        const input = normalize(value);
        let correct = false;

        const answer = question.correctAnswer;
        if (Array.isArray(answer)) {
            correct = answer.some(a => normalize(a) === input);
        } else {
            correct = normalize(answer as string) === input;
        }

        setSubmitted(true);
        setIsCorrect(correct);

        if (correct) {
            onAnswer(true, value);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= 2) {
                // Auto-advance on second failure
                onAnswer(false, value);
            }
        }
    };

    const isFailed = attempts >= 2 && !isCorrect;

    const getCorrectAnswerDisplay = () => {
        if (Array.isArray(question.correctAnswer)) {
            return question.correctAnswer.join(' or ');
        }
        return question.correctAnswer;
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>{question.prompt}</Typography>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your answer here..."
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    if (submitted) setSubmitted(false); // Clear submitted state on edit
                }}
                disabled={submitted && (isCorrect || isFailed)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && value && !submitted) {
                        handleSubmit();
                    }
                }}
                sx={{ mt: 2 }}
                error={submitted && !isCorrect}
            />

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
                                ? `Incorrect. The correct answer was: ${getCorrectAnswerDisplay()}`
                                : 'Incorrect, try again.'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
