import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { Pathway } from '@/lib/content/types';

interface PathwayCardProps {
    pathway: Pathway;
    packId: string;
}

export default function PathwayCard({ pathway, packId }: PathwayCardProps) {
    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                    {pathway.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {pathway.description}
                </Typography>
            </CardContent>
            <CardActions>
                <Link href={`/pathway/${pathway.id}`} passHref style={{ textDecoration: 'none' }}>
                    <Button size="small">Start Learning</Button>
                </Link>
            </CardActions>
        </Card>
    );
}
