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
        lessonId: string;
    }>;
}

export default async function LessonPage(props: Props) {
    const params = await props.params; // Await params in Next.js 15+

    // Scoped Lookup: Find pathway first, then lesson
    const packs = await getAllContentPacks();
    let lesson = null;
    let pathwayId = params.id;

    // Search across packs for the SPECIFIC pathway
    for (const pack of packs) {
        const foundPathway = pack.pathways.find(p => p.id === pathwayId);
        if (foundPathway) {
            // Found pathway, now simple lookup for lesson
            for (const unit of foundPathway.units) {
                const foundLesson = unit.lessons.find(l => l.id === params.lessonId);
                if (foundLesson) {
                    lesson = foundLesson;
                    break;
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
                    <Quiz lesson={lesson} pathwayId={pathwayId} />
                </Box>
            </Box>
        </Container>
    );
}
