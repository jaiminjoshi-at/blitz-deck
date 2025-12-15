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
                    <ListItem key={lesson.id} disablePadding sx={{ mb: 1 }}>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {lesson.title}
                                    {status === 'completed' && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <CheckCircleIcon color="success" fontSize="small" />
                                            <Typography variant="caption" color="success.main" fontWeight="bold">
                                                {bestScore}%
                                            </Typography>
                                        </Box>
                                    )}
                                    {status === 'in-progress' && (
                                        <Typography variant="caption" color="primary" sx={{ fontStyle: 'italic' }}>
                                            In Progress...
                                        </Typography>
                                    )}
                                </Box>
                            }
                            secondary={lesson.description}
                        />
                        <Link href={`/lesson/${lesson.id}`} passHref style={{ textDecoration: 'none' }}>
                            <Button
                                variant={status === 'completed' ? "text" : "outlined"}
                                size="small"
                                color={status === 'completed' ? "success" : "primary"}
                            >
                                {status === 'completed' ? "Review" : (status === 'in-progress' ? "Resume" : "Start")}
                            </Button>
                        </Link>
                    </ListItem>
                );
            })}
        </List>
    );
}
