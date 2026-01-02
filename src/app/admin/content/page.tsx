
import * as React from 'react';
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import PathwayCardActions from '@/components/Creator/PathwayCardActions';

export default async function CreatorStudio() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return null;

    // Fetch pathways created by this admin
    const userPathways = await db.query.pathways.findMany({
        where: (pathways, { eq }) => eq(pathways.creatorId, userId),
        with: {
            units: true
        }
    });

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Creator Studio
                </Typography>
                <Link href="/admin/content/create" passHref>
                    <Button variant="contained" startIcon={<AddIcon />}>
                        Create New Pathway
                    </Button>
                </Link>
            </Box>

            {userPathways.length === 0 ? (
                <Box sx={{
                    textAlign: 'center',
                    py: 8,
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'divider'
                }}>
                    <Typography color="text.secondary">You haven&apos;t created any pathways yet.</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {userPathways.map(pathway => {
                        const status = pathway.published ? 'published' : 'draft';
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={pathway.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="overline" color="text.secondary">
                                                PATHWAY
                                            </Typography>
                                            <Chip
                                                label={status}
                                                color={status === 'draft' ? 'warning' : 'success'}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="h6" component="div" gutterBottom fontWeight="bold">
                                            {pathway.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{
                                            mb: 2,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {pathway.description}
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                                            {pathway.units.length} Units
                                        </Typography>
                                    </CardContent>
                                    <PathwayCardActions
                                        packId="db" // Placeholder as we moved to DB
                                        pathwayId={pathway.id}
                                        status={status}
                                    />
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
}
