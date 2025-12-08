import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { getAllContentPacks } from '@/lib/content/contentLoader';
import { notFound } from 'next/navigation';
import Quiz from '@/components/Quiz/Quiz';

interface Props {
    params: Promise<{
        lessonId: string;
    }>;
}

export default async function LessonPage(props: Props) {
    const params = await props.params;
    const packs = await getAllContentPacks();
    let lesson = null;

    // Find lesson across all packs
    for (const pack of packs) {
        for (const pathway of pack.pathways) {
            for (const unit of pathway.units) {
                const found = unit.lessons.find(l => l.id === params.lessonId);
                if (found) {
                    lesson = found;
                    break;
                }
            }
            if (lesson) break;
        }
        if (lesson) break;
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
                    <Quiz lesson={lesson} />
                </Box>
            </Box>
        </Container>
    );
}
