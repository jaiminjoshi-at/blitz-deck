import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/GridLegacy';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import { getAllContentPacks } from '@/lib/content/contentLoader';
import PathwayCard from '@/components/PathwayCard';
import { PATHS } from '@/lib/constants';

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
          <Card variant="outlined" sx={{ mt: 4, maxWidth: 600, width: '100%', borderColor: 'warning.main' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="warning.main">
                No Content Found
              </Typography>
              <Typography variant="body1" paragraph>
                BlitzDeck could not find any content packs.
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                Scanning Directory: <strong>{PATHS.CONTENT_DIR}</strong>
              </Alert>

              <Typography variant="subtitle2" gutterBottom>
                Troubleshooting for Self-Hosted/Docker:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>Ensure you have mounted a volume to <code>/app/content</code> (or the custom path above).</li>
                <li>Check that your JSON files are valid and follow the naming convention (e.g. <code>*.json</code>).</li>
                <li>If running locally, check if the folder exists and has files.</li>
              </Box>
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
