
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users, pathways } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from 'next/link';

export default async function AdminDashboard() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return null;

    // Fetch Stats
    const [learnerCount] = await db.select({ value: count() }).from(users).where(eq(users.role, 'learner'));
    const [pathwayCount] = await db.select({ value: count() }).from(pathways).where(eq(pathways.creatorId, userId));

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Admin Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Welcome back, {session?.user?.name || "Admin"}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Stats Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Total Learners</Typography>
                            <Typography variant="h3" fontWeight="bold">
                                {learnerCount?.value || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>My Pathways</Typography>
                            <Typography variant="h3" fontWeight="bold">
                                {pathwayCount?.value || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Link href="/admin/content" passHref>
                                        <Button variant="contained" fullWidth size="large" sx={{ height: '100%' }}>
                                            Creator Studio
                                        </Button>
                                    </Link>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button variant="outlined" fullWidth size="large" disabled sx={{ height: '100%' }}>
                                        Manage Users (Soon)
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
