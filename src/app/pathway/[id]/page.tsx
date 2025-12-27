
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import UnitList from '@/components/UnitList';

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function PathwayPage(props: Props) {
    const params = await props.params;

    // Fetch Pathway with nested Units and Lessons from DB
    const pathway = await db.query.pathways.findFirst({
        where: (pathways, { eq }) => eq(pathways.id, params.id),
        with: {
            units: {
                orderBy: (units, { asc }) => [asc(units.order)],
                with: {
                    lessons: {
                        orderBy: (lessons, { asc }) => [asc(lessons.order)],
                    }
                }
            }
        }
    });

    if (!pathway) {
        notFound();
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    {pathway.title}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {pathway.description}
                </Typography>

                <Box sx={{ mt: 4 }}>
                    <UnitList units={pathway.units} pathwayId={params.id} />
                </Box>
            </Box>
        </Container>
    );
}
