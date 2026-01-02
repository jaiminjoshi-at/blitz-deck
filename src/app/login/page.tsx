
import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Image from 'next/image';

export default async function LoginPage(props: { searchParams: Promise<{ callbackUrl?: string, error?: string }> }) {
    const searchParams = await props.searchParams;
    const { error } = searchParams;

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default', // Use theme background
                p: 2,
            }}
        >
            <Container maxWidth="xs">
                <Card variant="outlined" sx={{ boxShadow: 3 }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>

                        {/* Logo & Header */}
                        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Image src="/logo.png" alt="BlitzDeck Logo" width={64} height={64} style={{ borderRadius: '12px', marginBottom: '16px' }} />
                            <Typography component="h1" variant="h5" fontWeight="bold">
                                BlitzDeck
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sign in to continue your learning journey
                            </Typography>
                        </Box>

                        {/* Error Alert */}
                        {error && (
                            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                                {error === 'InvalidCredentials'
                                    ? "Invalid email or password. Please try again."
                                    : "Authentication failed. Please check your credentials."}
                            </Alert>
                        )}

                        {/* Login Form */}
                        <Box
                            component="form"
                            action={async (formData) => {
                                "use server";
                                try {
                                    const email = formData.get("email") as string;
                                    const password = formData.get("password") as string;
                                    await signIn("credentials", {
                                        email,
                                        password,
                                        redirectTo: "/"
                                    });
                                } catch (error) {
                                    if ((error as any).type === 'CredentialsSignin') {
                                        redirect('/login?error=InvalidCredentials');
                                    }
                                    throw error;
                                }
                            }}
                            sx={{ width: '100%' }}
                        >
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                            >
                                Sign In
                            </Button>

                            {/* Testing Hint (can be removed in prod) */}
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    <strong>Admin:</strong> admin@test.com / password
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    <strong>Learner:</strong> learner@test.com / password
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
