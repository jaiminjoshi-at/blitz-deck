import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
            <FormControl component="fieldset">
                <FormLabel component="legend">{question.prompt}</FormLabel>
                <RadioGroup
                    aria-label="quiz"
                    name="quiz"
                    value={value}
                    onChange={handleChange}
                >
                    {shuffledOptions.map((option) => (
                        <FormControlLabel
                            key={option}
                            value={option}
                            control={<Radio />}
                            label={option}
                            disabled={submitted && (isCorrect || isFailed)}
                        />
                    ))}
                </RadioGroup>
                <Button
                    sx={{ mt: 1, mr: 1 }}
                    type="submit"
                    variant="outlined"
                    onClick={handleSubmit}
                    disabled={!value || (submitted && (isCorrect || isFailed))}
                >
                    {submitted && isFailed ? 'Next' : 'Check Answer'}
                </Button>
                {submitted && (
                    <Box sx={{ mt: 2 }}>
                        <Typography
                            color={isCorrect ? 'success.main' : 'error.main'}
                        >
                            {isCorrect
                                ? 'Correct!'
                                : isFailed
                                    ? `Incorrect. The correct answer was: ${question.correctAnswer}`
                                    : 'Incorrect, try again.'}
                        </Typography>
                    </Box>
                )}
            </FormControl>
        </Box>
    );
}
