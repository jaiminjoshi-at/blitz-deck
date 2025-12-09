import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣'];

interface AvatarPickerProps {
    currentAvatar: string;
    onSelect: (avatar: string) => void;
}

export default function AvatarPicker({ currentAvatar, onSelect }: AvatarPickerProps) {
    return (
        <Box>
            <Typography variant="subtitle1" gutterBottom>
                Choose an Avatar
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {AVATARS.map((avatar) => (
                    <IconButton
                        key={avatar}
                        onClick={() => onSelect(avatar)}
                        sx={{
                            border: currentAvatar === avatar ? '2px solid #1976d2' : '2px solid transparent',
                            backgroundColor: currentAvatar === avatar ? 'action.selected' : 'transparent',
                            fontSize: '1.5rem',
                        }}
                    >
                        {avatar}
                    </IconButton>
                ))}
            </Box>
        </Box>
    );
}
