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
import { Box } from '@mui/material';

interface LessonListProps {
    lessons: Lesson[];
}

export default function LessonList({ lessons }: LessonListProps) {
    // We use a hydration safe way to check store or just rely on client-side rendering
    const [hydrated, setHydrated] = React.useState(false);

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    const isLessonCompleted = useProgressStore((state) => state.isLessonCompleted);

    return (
        <List>
            {lessons.map((lesson) => {
                const completed = hydrated && isLessonCompleted(lesson.id);

                return (
                    <ListItem key={lesson.id} disablePadding sx={{ mb: 1 }}>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {lesson.title}
                                    {completed && (
                                        <CheckCircleIcon color="success" fontSize="small" />
                                    )}
                                </Box>
                            }
                            secondary={lesson.description}
                        />
                        <Link href={`/lesson/${lesson.id}`} passHref style={{ textDecoration: 'none' }}>
                            <Button
                                variant={completed ? "text" : "outlined"}
                                size="small"
                                color={completed ? "success" : "primary"}
                            >
                                {completed ? "Review" : "Start"}
                            </Button>
                        </Link>
                    </ListItem>
                );
            })}
        </List>
    );
}
