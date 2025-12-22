'use client';

import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import Button from '@mui/material/Button';
import Link from 'next/link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Lesson } from '@/lib/content/types';
import { useProgressStore } from '@/lib/store';
import { Box, Typography } from '@mui/material';

interface LessonListProps {
    lessons: Lesson[];
    pathwayId: string;
}

export default function LessonList({ lessons, pathwayId }: LessonListProps) {
    const [hydrated, setHydrated] = React.useState(false);

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    const getLessonProgress = useProgressStore((state) => state.getLessonProgress);

    return (
        <List>
            {lessons.map((lesson) => {
                const progress = hydrated ? getLessonProgress(lesson.id, pathwayId) : undefined;
                const status = progress?.status || 'not-started';
                const bestScore = progress?.bestScore;

                return (

                    <ListItem key={lesson.id} disablePadding sx={{ mb: 2, display: 'block' }}>
                        <Link href={`/pathway/${pathwayId}/lesson/${lesson.id}`} passHref style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
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

                                {/* Middle Stats Section */}
                                {status === 'completed' && (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        mx: 3,
                                        minWidth: 100
                                    }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                            BEST / LAST
                                        </Typography>
                                        <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }}>
                                            {bestScore}% <Typography component="span" variant="h6" color="text.secondary" fontWeight="regular">/ {progress?.lastScore ?? 0}%</Typography>
                                        </Typography>
                                    </Box>
                                )}

                                <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                                    <Button
                                        variant="contained" // Always contained as requested
                                        size="small"
                                        color={status === 'completed' ? "success" : "primary"}
                                        sx={{
                                            minWidth: 90,
                                            boxShadow: 2
                                        }}
                                        component="div"
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
