'use client';

import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { useProgressStore } from '@/lib/store';
import AvatarPicker from '@/components/Profile/AvatarPicker';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { profiles, activeProfileId, updateActiveProfile, deleteProfile } = useProgressStore();
    const router = useRouter();

    const user = profiles.find(p => p.id === activeProfileId);

    // Local state for form
    const [name, setName] = React.useState('');
    const [avatar, setAvatar] = React.useState('👋');

    // Load initial state when user is found
    React.useEffect(() => {
        if (user) {
            setName(user.name);
            setAvatar(user.avatar);
        }
    }, [user]);

    const handleSave = () => {
        updateActiveProfile({ name, avatar });
        alert('Profile saved!');
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this profile? This cannot be undone.')) {
            if (activeProfileId) {
                deleteProfile(activeProfileId);
                router.push('/'); // Will basically refresh to Landing Page since active is null
            }
        }
    };

    if (!user) return null; // Should be handled by AuthGuard, but safety first

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Edit Profile
                </Typography>

                <Paper sx={{ p: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Your Name"
                            variant="outlined"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                        />

                        <AvatarPicker
                            currentAvatar={avatar}
                            onSelect={setAvatar}
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleSave}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Paper>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" color="error" gutterBottom>
                    Danger Zone
                </Typography>
                <Paper sx={{ p: 3, border: '1px solid #ff1744' }}>
                    <Typography variant="body1" paragraph>
                        Deleting your profile will remove all progress and XP permanently.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDelete}
                    >
                        Delete Profile
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
}
