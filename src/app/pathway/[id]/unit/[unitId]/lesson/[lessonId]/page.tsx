
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Quiz from '@/components/Quiz/Quiz';
import { mapDBLessonToQuizLesson } from '@/lib/content/mappers';

interface Props {
    params: Promise<{
        id: string; // Pathway ID
        unitId: string;
        lessonId: string;
    }>;
}

export default async function LessonPage(props: Props) {
    const params = await props.params;

    // Fetch Lesson with Questions
    const lesson = await db.query.lessons.findFirst({
        where: (lessons, { eq }) => eq(lessons.id, params.lessonId),
        with: {
            questions: {
                orderBy: (questions, { asc }) => [asc(questions.order)],
            }
        }
    });

    if (!lesson) {
        notFound();
    }

    // Transform DB questions to match what Quiz component expects
    // Using strict mapper
    const quizLesson = mapDBLessonToQuizLesson(lesson);

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {lesson.title}
                </Typography>
                <Typography variant="body1" paragraph>
                    {lesson.learningContent}
                </Typography>

                <Box sx={{ mt: 4 }}>
                    {/* Pass unitId to Quiz for correct progress tracking */}
                    <Quiz lesson={quizLesson} pathwayId={params.id} unitId={params.unitId} />
                </Box>
            </Box>
        </Container>
    );
}
