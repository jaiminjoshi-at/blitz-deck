'use client';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useProgressStore } from '@/lib/store';

export default function Navigation() {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const { profiles, activeProfileId, selectProfile } = useProgressStore();

    // Derived state
    const activeProfile = profiles.find(p => p.id === activeProfileId);

    // Safety for hydration logic if needed, but client component usually fine

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSwitchProfile = () => {
        selectProfile(''); // Clear active profile -> AuthGuard renders LandingPage
        handleClose();
        router.push('/');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 1 }} onClick={() => router.push('/')}>
                        <Image src="/logo.png" alt="BlitzDeck Logo" width={32} height={32} style={{ marginRight: '10px', borderRadius: '8px' }} />
                        <Typography variant="h6" component="div">
                            BlitzDeck
                        </Typography>
                    </Box>
                    <Button color="inherit" component={Link} href="/">Home</Button>

                    {activeProfile && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                color="inherit"
                                onClick={handleMenu}
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                sx={{ textTransform: 'none' }}
                            >
                                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                                    {activeProfile.name}
                                </Typography>
                                <Typography variant="h6">
                                    {activeProfile.avatar}
                                </Typography>
                            </Button>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => { router.push('/profile'); handleClose(); }}>Profile</MenuItem>
                                <MenuItem onClick={handleSwitchProfile}>Switch Profile</MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
        </Box>
    );
}
