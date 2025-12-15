'use client';

import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { useProgressStore } from '@/lib/store';
import AvatarPicker from '@/components/Profile/AvatarPicker';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { profiles, activeProfileId, updateActiveProfile, deleteProfile } = useProgressStore();
    const router = useRouter();

    const user = profiles.find(p => p.id === activeProfileId);

    // Local state
    const [name, setName] = React.useState('');
    const [avatar, setAvatar] = React.useState('👋');
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

    // Load initial state
    React.useEffect(() => {
        if (user) {
            setName(user.name);
            setAvatar(user.avatar);
        }
    }, [user]);

    const handleSave = () => {
        updateActiveProfile({ name, avatar });
        setShowSuccess(true);
    };

    const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (activeProfileId) {
            deleteProfile(activeProfileId);
            router.push('/');
        }
        setShowDeleteDialog(false);
    };

    if (!user) return null;

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
                        onClick={handleDeleteClick}
                    >
                        Delete Profile
                    </Button>
                </Paper>
            </Box>

            {/* Success Toast */}
            <Snackbar
                open={showSuccess}
                autoHideDuration={4000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    Profile saved successfully!
                </Alert>
            </Snackbar>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
            >
                <DialogTitle>Delete Profile?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this profile? All progress including completed lessons will be permanently lost.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Delete Permanently
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
