import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import { getAllContentPacks } from '@/lib/content/contentLoader';
import PathwayCardActions from '@/components/Creator/PathwayCardActions';

export const dynamic = 'force-dynamic';

export default async function CreatorDashboard() {
    const packs = await getAllContentPacks({ includeDrafts: true });

    // Flatten pathways for display
    const pathways = packs.flatMap(pack =>
        pack.pathways.map(pathway => ({
            ...pathway,
            packId: pack.id
        }))
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    My Content
                </Typography>
                <Link href="/creator/create" passHref>
                    <Button variant="contained" startIcon={<AddIcon />}>
                        Create New Pathway
                    </Button>
                </Link>
            </Box>

            {pathways.length === 0 ? (
                <Typography color="text.secondary">No content found. Start creating!</Typography>
            ) : (
                <Grid container spacing={3}>
                    {pathways.map(pathway => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`${pathway.packId}-${pathway.id}`}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="overline" color="text.secondary">
                                            {pathway.packId}
                                        </Typography>
                                        <Chip
                                            label={pathway.status || 'published'}
                                            color={pathway.status === 'draft' ? 'warning' : 'success'}
                                            size="small"
                                        />
                                    </Box>
                                    <Typography variant="h6" component="div" gutterBottom>
                                        {pathway.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {pathway.description}
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                                        {pathway.units.length} Units
                                    </Typography>
                                </CardContent>
                                <PathwayCardActions
                                    packId={pathway.packId}
                                    pathwayId={pathway.id}
                                    status={pathway.status || 'published'}
                                />
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
