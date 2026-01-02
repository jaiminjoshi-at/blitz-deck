'use client';

import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import Button from '@mui/material/Button';
import Link from 'next/link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { LessonSummary } from '@/lib/content/types';
import { useProgressStore } from '@/lib/store';
import { Box, Typography } from '@mui/material';

interface LessonListProps {
    lessons: LessonSummary[];
    pathwayId: string;
    unitId: string;
}

export default function LessonList({ lessons, pathwayId, unitId }: LessonListProps) {
    const [hydrated, setHydrated] = React.useState(false);

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    // Subscribe to lessonStatus to ensure re-renders when progress updates
    const lessonStatus = useProgressStore((state) => state.lessonStatus);
    const activeProfileId = useProgressStore((state) => state.activeProfileId); // Force re-render on profile load
    const getLessonProgress = useProgressStore((state) => state.getLessonProgress);

    // Dummy usage to satisfy linter while maintaining subscription
    React.useEffect(() => {
        void lessonStatus;
    }, [lessonStatus]);

    return (
        <List>
            {lessons.map((lesson) => {
                const progress = hydrated ? getLessonProgress(lesson.id, pathwayId, unitId) : undefined;
                const status = progress?.status || 'not-started';
                const bestScore = progress?.bestScore;

                return (

                    <ListItem key={lesson.id} disablePadding sx={{ mb: 2, display: 'block' }}>
                        <Link href={`/pathway/${pathwayId}/unit/${unitId}/lesson/${lesson.id}`} passHref style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
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
                                        justifyContent: 'center',
                                        mx: 3,
                                        minWidth: 140,
                                        gap: 0.5
                                    }}>
                                        <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8rem' }}>
                                            <Box component="span" color="text.secondary">Best:</Box>
                                            <Box component="span" fontWeight="medium">
                                                {bestScore}% <Typography component="span" variant="caption" color="text.secondary">({progress?.bestTime ? `${Math.floor(progress.bestTime / 60)}m ${Math.round(progress.bestTime % 60)}s` : '-'})</Typography>
                                            </Box>
                                        </Typography>
                                        <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8rem' }}>
                                            <Box component="span" color="text.secondary">Last:</Box>
                                            <Box component="span">
                                                {progress?.lastScore ?? 0}% <Typography component="span" variant="caption" color="text.secondary">({progress?.lastTime ? `${Math.floor(progress.lastTime / 60)}m ${Math.round(progress.lastTime % 60)}s` : '-'})</Typography>
                                            </Box>
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
                                        {/* Show Resume if in-progress OR if completed but attempting retake (index > 0) */}
                                        {(status === 'in-progress' || (status === 'completed' && (progress?.currentQuestionIndex || 0) > 0))
                                            ? "Resume"
                                            : (status === 'completed' ? "Review" : "Start")}
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
