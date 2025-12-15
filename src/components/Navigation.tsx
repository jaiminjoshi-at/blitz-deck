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
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useProgressStore } from '@/lib/store';

export default function Navigation() {
    const router = useRouter();
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const { profiles, activeProfileId, selectProfile } = useProgressStore();

    // Derived state
    const activeProfile = profiles.find(p => p.id === activeProfileId);

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleSwitchProfile = () => {
        selectProfile(''); // Clear active profile -> AuthGuard renders LandingPage
        setDrawerOpen(false);
        router.push('/');
    };

    const handleProfileClick = () => {
        router.push('/profile');
        setDrawerOpen(false);
    };

    const drawerList = (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                <ListItem key="profile" disablePadding>
                    <ListItemButton onClick={handleProfileClick}>
                        <ListItemIcon>
                            <Typography variant="h6">{activeProfile?.avatar}</Typography>
                        </ListItemIcon>
                        <ListItemText primary="My Profile" secondary={activeProfile?.name} />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem key="home" disablePadding>
                    <ListItemButton onClick={() => router.push('/')}>
                        <ListItemText primary="Home" />
                    </ListItemButton>
                </ListItem>
                <ListItem key="switch" disablePadding>
                    <ListItemButton onClick={handleSwitchProfile}>
                        <ListItemText primary="Switch Profile" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ height: { xs: 56, sm: 64 }, justifyContent: 'center' }}>
                <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>

                    {/* Back Button Logic */}
                    {pathname !== '/' && (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="back"
                            sx={{ mr: 1 }}
                            onClick={() => {
                                // Intelligent Back Navigation
                                if (pathname.startsWith('/pathway/')) {
                                    router.push('/');
                                } else if (pathname.startsWith('/lesson/')) {
                                    // ideally we go back to the pathway, but we don't know ID easily here without looking up the lesson.
                                    // For now, let's trust router.back() for lesson->pathway as it's the natural flow,
                                    // BUT if history length is short (refresh), maybe fallback?
                                    // Simplest fix for "After completing lesson... back... takes to lesson":
                                    // The issue is likely: Pathway -> Lesson -> (Finish->Push Pathway) -> Pathway. Back -> Lesson.
                                    // If we are on Pathway, we handled it above (Push /).
                                    // If we are on Lesson, Back -> Pathway is correct.
                                    router.back();
                                } else {
                                    router.back();
                                }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    )}

                    {!pathname.includes('lesson') && pathname === '/' && (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2, display: { md: 'none' } }} // Hide on larger screens if we had a distinct sidebar
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 1 }} onClick={() => router.push('/')}>
                        <Image src="/logo.png" alt="BlitzDeck Logo" width={32} height={32} style={{ marginRight: '10px', borderRadius: '8px' }} />
                        <Typography variant="h6" component="div" sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
                            BlitzDeck
                        </Typography>
                    </Box>

                    {/* Desktop Links (Optional - keeping simple for now, can add if needed) */}
                    {/* <Button color="inherit" component={Link} href="/" sx={{ display: { xs: 'none', sm: 'block' } }}>Home</Button> */}

                    {activeProfile && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                color="inherit"
                                onClick={toggleDrawer(true)}
                                sx={{ textTransform: 'none', p: 1 }}
                            >
                                <Typography variant="subtitle1" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                                    {activeProfile.name}
                                </Typography>
                                <Typography variant="h5">
                                    {activeProfile.avatar}
                                </Typography>
                            </Button>

                            <Drawer
                                anchor="right"
                                open={drawerOpen}
                                onClose={toggleDrawer(false)}
                            >
                                {drawerList}
                            </Drawer>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
        </Box>
    );
}
