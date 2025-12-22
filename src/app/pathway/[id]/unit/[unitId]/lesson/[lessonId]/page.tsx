import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { getAllContentPacks } from '@/lib/content/contentLoader';
import { notFound } from 'next/navigation';
import Quiz from '@/components/Quiz/Quiz';

interface Props {
    params: Promise<{
        id: string; // Pathway ID
        unitId: string;
        lessonId: string;
    }>;
}

export default async function LessonPage(props: Props) {
    const params = await props.params;

    // Scoped Lookup: Find pathway first, then unit, then lesson
    const packs = await getAllContentPacks();
    let lesson = null;
    let pathwayId = params.id;
    let unitId = params.unitId;

    // Search across packs for the SPECIFIC pathway
    for (const pack of packs) {
        const foundPathway = pack.pathways.find(p => p.id === pathwayId);
        if (foundPathway) {
            // Found pathway, now specific lookup for unit
            const foundUnit = foundPathway.units.find(u => u.id === unitId);
            if (foundUnit) {
                // Found unit, now specific lookup for lesson
                const foundLesson = foundUnit.lessons.find(l => l.id === params.lessonId);
                if (foundLesson) {
                    lesson = foundLesson;
                }
            }
            break; // Stop searching packs once pathway is found
        }
    }

    if (!lesson) {
        notFound();
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {lesson.title}
                </Typography>
                <Typography variant="body1" paragraph>
                    {lesson.content}
                </Typography>

                <Box sx={{ mt: 4 }}>
                    {/* Pass unitId to Quiz for correct progress tracking */}
                    <Quiz lesson={lesson} pathwayId={pathwayId} unitId={unitId} />
                </Box>
            </Box>
        </Container>
    );
}
