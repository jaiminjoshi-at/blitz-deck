import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/GridLegacy';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { getAllContentPacks } from '@/lib/content/contentLoader';
import PathwayCard from '@/components/PathwayCard';

// Force dynamic rendering to allow hot-reloading of content packs
export const dynamic = 'force-dynamic';

export default async function Home() {
  const packs = await getAllContentPacks();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          BlitzDeck
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Build it. Deck it. Know it.
        </Typography>

        {packs.length === 0 ? (
          <Card variant="outlined" sx={{ mt: 4, maxWidth: 600, width: '100%', textAlign: 'center', p: 4 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Welcome to BlitzDeck
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 4 }}>
                Your library is empty. Start by creating your first learning pathway in the Creator Studio.
              </Typography>
              <Link href="/creator" passHref>
                <Button variant="contained" size="large">
                  Open Creator Studio
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2} sx={{ mt: 4 }}>
            {packs.map((pack) => (
              pack.pathways.map((pathway) => (
                <Grid item xs={12} sm={6} md={3} key={`${pack.id}-${pathway.id}`}>
                  <PathwayCard pathway={pathway} />
                </Grid>
              ))
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
