import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { loadContentPack, getAllContentPacks } from '@/lib/content/contentLoader';
import { notFound } from 'next/navigation';
import LessonList from '@/components/LessonList';

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
                    {pathway.units.map((unit) => (
                        <Accordion key={unit.id} defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">{unit.title}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {unit.description}
                                </Typography>
                                <LessonList lessons={unit.lessons} />
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Box>
        </Container>
    );
}
