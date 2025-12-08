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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue((event.target as HTMLInputElement).value);
        setSubmitted(false);
    };

    const handleSubmit = () => {
        const correct = value === question.correctAnswer;
        setIsCorrect(correct);
        setSubmitted(true);
        if (correct) {
            onAnswer(true);
        }
    };

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
                    {question.options?.map((option) => (
                        <FormControlLabel
                            key={option}
                            value={option}
                            control={<Radio />}
                            label={option}
                            disabled={submitted && isCorrect}
                        />
                    ))}
                </RadioGroup>
                <Button
                    sx={{ mt: 1, mr: 1 }}
                    type="submit"
                    variant="outlined"
                    onClick={handleSubmit}
                    disabled={!value || (submitted && isCorrect)}
                >
                    Check Answer
                </Button>
                {submitted && (
                    <Typography
                        sx={{ mt: 2 }}
                        color={isCorrect ? 'success.main' : 'error.main'}
                    >
                        {isCorrect ? 'Correct!' : 'Incorrect, try again.'}
                    </Typography>
                )}
            </FormControl>
        </Box>
    );
}
