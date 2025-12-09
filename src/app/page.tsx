import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { getAllContentPacks } from '@/lib/content/contentLoader';
import PathwayCard from '@/components/PathwayCard';

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
          LingoPro
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Welcome to your language learning journey.
        </Typography>

        <Grid container spacing={2} sx={{ mt: 4 }}>
          {packs.map((pack) => (
            pack.pathways.map((pathway) => (
              <Grid key={`${pack.id}-${pathway.id}`} size={{ xs: 12, sm: 6, md: 3 }}>
                <PathwayCard pathway={pathway} packId={pack.id} />
              </Grid>
            ))
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
