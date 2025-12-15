'use client';

import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Link from 'next/link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Lesson } from '@/lib/content/types';
import { useProgressStore } from '@/lib/store';
import { Box, Typography } from '@mui/material';

interface LessonListProps {
    lessons: Lesson[];
}

export default function LessonList({ lessons }: LessonListProps) {
    const [hydrated, setHydrated] = React.useState(false);

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    const getLessonProgress = useProgressStore((state) => state.getLessonProgress);

    return (
        <List>
            {lessons.map((lesson) => {
                const progress = hydrated ? getLessonProgress(lesson.id) : undefined;
                const status = progress?.status || 'not-started';
                const bestScore = progress?.bestScore;

                return (

                    <ListItem key={lesson.id} disablePadding sx={{ mb: 2, display: 'block' }}>
                        <Link href={`/lesson/${lesson.id}`} passHref style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <Box
                                sx={{
                                    p: 2,
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'background-color 0.2s',
                                    '&:hover': { bgcolor: 'action.hover' },
                                    bgcolor: 'background.paper'
                                }}
                            >
                                <Box sx={{ flex: 1, mr: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            {lesson.title}
                                        </Typography>
                                        {status === 'completed' && (
                                            <CheckCircleIcon color="success" fontSize="small" />
                                        )}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {lesson.description}
                                    </Typography>
                                </Box>

                                <Box sx={{ textAlign: 'right' }}>
                                    {status === 'completed' && (
                                        <Typography variant="caption" display="block" color="success.main" fontWeight="bold" sx={{ mb: 0.5 }}>
                                            {bestScore}%
                                        </Typography>
                                    )}
                                    <Button
                                        variant={status === 'completed' ? "text" : "contained"}
                                        size="small"
                                        color={status === 'completed' ? "success" : "primary"}
                                        sx={{ minWidth: 80 }}
                                        component="div" // Helper to avoid nested button issues if any, though standard Button inside Link is valid in Next.js usually, but we want the whole row clickable.
                                    // Actually, if we wrap the whole thing in Link, we shouldn't have a Button inside. It's invalid HTML (button inside a).
                                    // Let's use a "fake" button visual or just text.
                                    >
                                        {status === 'completed' ? "Review" : (status === 'in-progress' ? "Resume" : "Start")}
                                    </Button>
                                </Box>
                            </Box>
                        </Link>
                    </ListItem>
                );
            })}
        </List>
    );
}
