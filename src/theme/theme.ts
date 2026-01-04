'use client';
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    typography: {
        fontFamily: roboto.style.fontFamily,
        h1: { marginBottom: '0.5rem' },
        h2: { marginBottom: '0.5rem' },
        h3: { marginBottom: '0.5rem' },
        h4: { marginBottom: '0.5rem' },
        h5: { marginBottom: '0.35rem' },
        h6: { marginBottom: '0.35rem' },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: {
                    height: '100%',
                    overflow: 'hidden',
                },
                body: {
                    height: '100%',
                    overflow: 'hidden',
                },
            },
        },
    },
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

export default theme;
