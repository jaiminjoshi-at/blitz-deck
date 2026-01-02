import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { notFound } from 'next/navigation';
import Quiz from '@/components/Quiz/Quiz';
import { db } from '@/lib/db';
import { lessons } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { mapDBLessonToQuizLesson } from '@/lib/content/mappers';

interface Props {
    params: Promise<{
        id: string; // Pathway ID
        lessonId: string;
    }>;
}

export default async function LessonPage(props: Props) {
    const params = await props.params; // Await params in Next.js 15+

    const lessonRecord = await db.query.lessons.findFirst({
        where: eq(lessons.id, params.lessonId),
        with: {
            questions: {
                orderBy: (questions, { asc }) => [asc(questions.order)],
            }
        }
    });

    if (!lessonRecord) {
        notFound();
    }

    // Map to Quiz Lesson type
    const lesson = mapDBLessonToQuizLesson(lessonRecord);

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
                    <Quiz lesson={lesson} pathwayId={params.id} unitId={lessonRecord.unitId} />
                </Box>
            </Box>
        </Container>
    );
}
