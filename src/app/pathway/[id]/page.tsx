import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { getAllContentPacks } from '@/lib/content/contentLoader';
import { notFound } from 'next/navigation';
import UnitList from '@/components/UnitList';

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function PathwayPage(props: Props) {
    const params = await props.params;
    // In a real app, we'd look up the pack by pathway ID. 
    // For now, we'll search all packs for the pathway.
    const packs = await getAllContentPacks();
    let pathway = null;

    for (const pack of packs) {
        const found = pack.pathways.find(p => p.id === params.id);
        if (found) {
            pathway = found;
            break;
        }
    }

    if (!pathway) {
        notFound();
    }

    const units = pathway.units;

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
                    <UnitList units={units} />
                </Box>
            </Box>
        </Container>
    );
}
