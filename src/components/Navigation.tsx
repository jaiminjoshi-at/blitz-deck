'use client';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

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
import { useSession, signOut } from 'next-auth/react';

export default function Navigation() {
    const router = useRouter();
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const { data: session } = useSession();

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

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/login');
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
                    <ListItemButton>
                        <ListItemIcon>
                            {/* Placeholder Avatar - could use session image if available */}
                            <Typography variant="h6">👤</Typography>
                        </ListItemIcon>
                        <ListItemText
                            primary={session?.user?.name || "User"}
                            secondary={session?.user?.email}
                        />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem key="home" disablePadding>
                    <ListItemButton onClick={() => router.push('/')}>
                        <ListItemText primary="Home" />
                    </ListItemButton>
                </ListItem>

                {/* Admin Only Links */}
                {session?.user?.role === 'admin' && (
                    <>
                        <Divider />
                        <ListItem key="creator" disablePadding>
                            <ListItemButton onClick={() => {
                                router.push('/admin/content'); // Updated to new path
                                setDrawerOpen(false);
                            }}>
                                <ListItemIcon>
                                    <Typography variant="h6">🎨</Typography>
                                </ListItemIcon>
                                <ListItemText primary="Creator Studio" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}

                <Divider />
                <ListItem key="signout" disablePadding>
                    <ListItemButton onClick={handleSignOut}>
                        <ListItemText primary="Sign Out" />
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
                    {pathname !== '/' && pathname !== '/dashboard' && pathname !== '/admin' && pathname !== '/login' && (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="back"
                            sx={{ mr: 1 }}
                            onClick={() => {
                                // Deterministic "Up" Navigation
                                if (pathname.includes('/lesson/')) {
                                    // /pathway/[id]/unit/.../lesson/... -> /pathway/[id]
                                    const match = pathname.match(/^\/pathway\/([^/]+)/);
                                    if (match) router.push(`/pathway/${match[1]}`);
                                    else router.push('/dashboard');
                                } else if (pathname.startsWith('/pathway/')) {
                                    router.push('/dashboard');
                                } else if (pathname.startsWith('/admin/content')) {
                                    if (pathname === '/admin/content') router.push('/admin');
                                    else router.push('/admin/content');
                                } else {
                                    // Fallback: Default history back
                                    router.back();
                                }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    )}

                    {!pathname.includes('lesson') && (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2, display: { md: 'none' } }} // Hide on larger screens if we had a distinct sidebar
                            onClick={toggleDrawer(true)}
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

                    {session?.user && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                color="inherit"
                                onClick={toggleDrawer(true)}
                                sx={{ textTransform: 'none', p: 1 }}
                            >
                                <Typography variant="subtitle1" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                                    {session.user.name || "User"}
                                </Typography>
                                <Typography variant="h5">
                                    👤
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
