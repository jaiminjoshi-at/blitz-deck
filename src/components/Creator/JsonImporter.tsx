'use client';
import * as React from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { PathwayImportSchema } from '@/lib/content/schemas';
import { z } from 'zod';

interface JsonImporterProps {
    onImport: (data: z.infer<typeof PathwayImportSchema>) => void;
    defaultValue?: string;
}

export default function JsonImporter({ onImport, defaultValue = '' }: JsonImporterProps) {
    const [jsonInput, setJsonInput] = React.useState(defaultValue);
    const [error, setError] = React.useState<string | null>(null);

    const handleValidate = () => {
        setError(null);
        try {
            const parsed = JSON.parse(jsonInput);
            const result = PathwayImportSchema.safeParse(parsed);

            if (result.success) {
                onImport(result.data);
            } else {
                setError(`Validation Error: ${result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
            }
        } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(`Invalid JSON syntax: ${e.message}`);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Step 5: Import and Validate</Typography>
            <Typography variant="body2" color="text.secondary">
                Paste the JSON output from your LLM here. We will validate it before saving.
            </Typography>

            <TextField
                multiline
                rows={15}
                fullWidth
                variant="outlined"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                onBlur={() => {
                    try {
                        if (jsonInput.trim()) {
                            const parsed = JSON.parse(jsonInput);
                            setJsonInput(JSON.stringify(parsed, null, 2));
                        }
                    } catch {
                        // Ignore formatting errors if invalid JSON, it will be caught by validate
                    }
                }}
                placeholder='{ "title": "My Course", ... }'
                sx={{ fontFamily: 'monospace' }}
            />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Button
                variant="contained"
                color="primary"
                onClick={handleValidate}
                disabled={!jsonInput.trim()}
            >
                Validate & Preview
            </Button>
        </Box>
    );
}
