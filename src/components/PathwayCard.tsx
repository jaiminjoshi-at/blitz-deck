'use client';
import * as React from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { Pathway } from '@/lib/content/types';
import { useProgressStore } from '@/lib/store';
import CardActionArea from '@mui/material/CardActionArea';

interface PathwayCardProps {
    pathway: Pathway;
    packId: string;
}

export default function PathwayCard({ pathway, packId }: PathwayCardProps) {
    const isLessonCompleted = useProgressStore((state) => state.isLessonCompleted);
    const [hydrated, setHydrated] = React.useState(false);

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    // Calculate Progress
    const allLessons = pathway.units.flatMap(u => u.lessons);
    const totalLessons = allLessons.length;
    const completedCount = allLessons.filter(l => hydrated && isLessonCompleted(l.id)).length;
    const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                    borderColor: 'primary.main',
                },
                border: '1px solid transparent',
            }}
            variant="outlined"
            data-testid="pathway-card"
        >
            <Link href={`/pathway/${pathway.id}`} passHref style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}>
                <CardActionArea sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Box sx={{
                                fontSize: '1.5rem',
                                lineHeight: 1,
                                p: 1,
                                bgcolor: 'action.hover',
                                borderRadius: 1
                            }}>
                                {pathway.icon || '📚'}
                            </Box>
                            <Typography variant="h6" component="div" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                {pathway.title}
                            </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {pathway.description}
                        </Typography>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ width: '100%', mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="primary" fontWeight="bold">
                                {Math.round(progress)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {completedCount}/{totalLessons}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 4,
                                borderRadius: 2,
                                bgcolor: 'action.hover',
                            }}
                        />
                    </Box>
                </CardActionArea>
            </Link>
        </Card>
    );
}
