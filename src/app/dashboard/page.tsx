
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PathwayCard from "@/components/PathwayCard";
import Alert from '@mui/material/Alert';

export default async function LearnerDashboard() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        // Fallback if middleware fails
        redirect('/login');
    }

    // 1. Get Learner's Assigned Admin
    // We trust the session to have the correct assignedAdminId from the JWT callback
    const assignedAdminId = session.user.assignedAdminId;

    if (!assignedAdminId) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="info">You do not have an instructor assigned. Please contact support.</Alert>
            </Container>
        );
    }

    // 2. Fetch Content assigned by that Admin
    // Using relational query to get full hierarchy for progress calculation matching PathwayCard expectation
    const assignedPathways = await db.query.pathways.findMany({
        where: (pathways, { eq, and }) => and(
            eq(pathways.creatorId, assignedAdminId),
            eq(pathways.published, true)
        ),
        with: {
            units: {
                with: {
                    lessons: true
                }
            }
        }
    });

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Learner Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Welcome back, {session?.user?.name || "Learner"}
                </Typography>
            </Box>

            <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                    My Assigned Content
                </Typography>

                {assignedPathways.length === 0 ? (
                    <Alert severity="info">Your instructor hasn&apos;t assigned any content yet.</Alert>
                ) : (
                    <Grid container spacing={3}>
                        {assignedPathways.map((pathway) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pathway.id}>
                                <PathwayCard pathway={{
                                    ...pathway,
                                    units: pathway.units.map(u => ({
                                        ...u,
                                        lessons: u.lessons.map(l => ({
                                            ...l,
                                            content: l.learningContent || '',
                                            description: l.description || '', // Handle null description
                                            questions: []
                                        }))
                                    }))
                                }} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
}
