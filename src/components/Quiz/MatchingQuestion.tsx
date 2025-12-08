import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Question } from '@/lib/content/types';

interface Props {
    question: Question;
    onAnswer: (isCorrect: boolean) => void;
}

export default function MatchingQuestion({ question, onAnswer }: Props) {
    const [selectedLeft, setSelectedLeft] = React.useState<string | null>(null);
    const [matches, setMatches] = React.useState<Record<string, string>>({});
    const [completed, setCompleted] = React.useState(false);

    const leftItems = Object.keys(question.pairs || {});
    const rightItems = Object.values(question.pairs || {});

    // Shuffle right items for randomness (simple shuffle)
    const [shuffledRightItems] = React.useState(() => [...rightItems].sort(() => Math.random() - 0.5));

    const handleLeftClick = (item: string) => {
        if (matches[item]) return; // Already matched
        setSelectedLeft(item);
    };

    const handleRightClick = (item: string) => {
        if (!selectedLeft) return;

        // Check match
        const correctMatch = question.pairs?.[selectedLeft];
        if (correctMatch === item) {
            const newMatches = { ...matches, [selectedLeft]: item };
            setMatches(newMatches);
            setSelectedLeft(null);

            if (Object.keys(newMatches).length === leftItems.length) {
                setCompleted(true);
                onAnswer(true);
            }
        } else {
            // Incorrect match logic (could add visual feedback)
            setSelectedLeft(null);
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>{question.prompt}</Typography>
            <Grid container spacing={4}>
                <Grid size={{ xs: 6 }}>
                    {leftItems.map((item) => (
                        <Paper
                            key={item}
                            sx={{
                                p: 2,
                                mb: 1,
                                cursor: matches[item] ? 'default' : 'pointer',
                                bgcolor: matches[item] ? 'success.light' : selectedLeft === item ? 'primary.light' : 'background.paper',
                            }}
                            onClick={() => handleLeftClick(item)}
                        >
                            {item}
                        </Paper>
                    ))}
                </Grid>
                <Grid size={{ xs: 6 }}>
                    {shuffledRightItems.map((item) => {
                        const isMatched = Object.values(matches).includes(item);
                        return (
                            <Paper
                                key={item}
                                sx={{
                                    p: 2,
                                    mb: 1,
                                    cursor: isMatched ? 'default' : 'pointer',
                                    bgcolor: isMatched ? 'success.light' : 'background.paper',
                                }}
                                onClick={() => handleRightClick(item)}
                            >
                                {item}
                            </Paper>
                        );
                    })}
                </Grid>
            </Grid>
            {completed && (
                <Typography sx={{ mt: 2 }} color="success.main">
                    All matched!
                </Typography>
            )}
        </Box>
    );
}
