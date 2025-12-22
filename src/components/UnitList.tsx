'use client';

import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import LessonList from '@/components/LessonList';
import { Unit } from '@/lib/content/types';
import { useProgressStore } from '@/lib/store';

interface UnitListProps {
    units: Unit[];
    pathwayId: string;
}

export default function UnitList({ units, pathwayId }: UnitListProps) {
    const isLessonCompleted = useProgressStore((state) => state.isLessonCompleted);

    // Hydration check
    const [hydrated, setHydrated] = React.useState(false);
    React.useEffect(() => {
        setHydrated(true);
    }, []);

    return (
        <>
            {units.map((unit) => {
                const totalLessons = unit.lessons.length;
                const completedCount = unit.lessons.filter(l => hydrated && isLessonCompleted(l.id, pathwayId, unit.id)).length;
                const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

                return (
                    <Accordion key={unit.id} defaultExpanded sx={{ mb: 3, '&:before': { display: 'none' }, borderRadius: 2 }}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ minHeight: 64, '& .MuiAccordionSummary-content': { my: 2 } }}
                        >
                            <Box sx={{ width: '100%', mr: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6">{unit.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {completedCount}/{totalLessons} ({Math.round(progress)}%)
                                    </Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={progress} />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {unit.description}
                            </Typography>
                            <LessonList lessons={unit.lessons} pathwayId={pathwayId} unitId={unit.id} />
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </>
    );
}
