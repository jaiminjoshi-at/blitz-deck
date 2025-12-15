'use client';

import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AvatarPicker from '@/components/Profile/AvatarPicker';
import { useProgressStore } from '@/lib/store';
import Image from 'next/image';

export default function LandingPage() {
    const { profiles, selectProfile, addProfile } = useProgressStore();
    const [isCreateOpen, setCreateOpen] = React.useState(false);
    const [newName, setNewName] = React.useState('');
    const [newAvatar, setNewAvatar] = React.useState('👋');

    const handleCreate = () => {
        if (newName.trim()) {
            addProfile(newName, newAvatar);
            // Select logic is handled automatically in store or we can do it explicit
            // Dialog closes automatically? No we need to close it
            setCreateOpen(false);
            setNewName('');
            setNewAvatar('👋');
        }
    };

    return (
        <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

            <Box sx={{ textAlign: 'center', mb: 8 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Image src="/logo.png" alt="BlitzDeck Logo" width={120} height={120} />
                </Box>
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    BlitzDeck
                </Typography>
                <Typography variant="h4" color="text.secondary">
                    Build it. Deck it. Know it.
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                {profiles.map((profile) => (
                    <Card key={profile.id} sx={{ width: 150, height: 180 }}>
                        <CardActionArea
                            onClick={() => selectProfile(profile.id)}
                            sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Typography variant="h1" sx={{ fontSize: '4rem', mb: 1 }}>
                                {profile.avatar}
                            </Typography>
                            <Typography variant="h6" noWrap sx={{ maxWidth: '90%' }}>
                                {profile.name}
                            </Typography>
                        </CardActionArea>
                    </Card>
                ))}

                <Card sx={{ width: 150, height: 180, border: '2px dashed #ccc' }} variant="outlined">
                    <CardActionArea
                        onClick={() => setCreateOpen(true)}
                        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}
                    >
                        <AddCircleOutlineIcon sx={{ fontSize: 60, mb: 1 }} />
                        <Typography variant="button">Add Profile</Typography>
                    </CardActionArea>
                </Card>
            </Box>

            {/* Create Profile Dialog */}
            <Dialog open={isCreateOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>New Profile</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Name"
                            autoFocus
                            fullWidth
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Choose Avatar</Typography>
                            <AvatarPicker currentAvatar={newAvatar} onSelect={setNewAvatar} />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={!newName.trim()}>
                        Create Profile
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
