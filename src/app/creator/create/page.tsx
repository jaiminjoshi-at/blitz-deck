'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/GridLegacy';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import { generateSystemPrompt, PromptStructure, QuestionTypeRegistry } from '@/lib/ai/promptGenerator';
import { QuestionType } from '@/lib/content/types';
import JsonImporter from '@/components/Creator/JsonImporter';
import { saveDraftPathway } from '@/app/actions/content';
import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import { copyToClipboard } from '@/lib/utils';
import { PathwayImportSchema } from '@/lib/content/schemas';
import { z } from 'zod';

type PathwayImport = z.infer<typeof PathwayImportSchema>;

// Updated Steps
const steps = ['Details', 'Structure', 'Configuration', 'Generate', 'Import', 'Preview'];

export default function WorkflowWizard() {
    const router = useRouter();
    const [activeStep, setActiveStep] = React.useState(0);

    // Form State
    const [details, setDetails] = React.useState({
        topic: '',
        description: '',
        audience: ''
    });

    const [units, setUnits] = React.useState<{ title: string; description: string; lessons: { title: string; types: QuestionType[] }[] }[]>([
        { title: 'Unit 1', description: '', lessons: [{ title: 'Lesson 1', types: [] }] }
    ]);

    // Derived Prompt
    const [generatedPrompt, setGeneratedPrompt] = React.useState('');

    // Validated Data for Preview
    const [previewData, setPreviewData] = React.useState<PathwayImport | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    // Error State
    const [detailsErrors, setDetailsErrors] = React.useState({
        topic: '',
        description: '',
        audience: ''
    });
    const [unitsErrors, setUnitsErrors] = React.useState<{ title: string; description: string; lessons: { title: string; types: string }[] }[]>([]);

    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('error');

    const showSnackbar = (msg: string, severity: 'success' | 'info' | 'warning' | 'error' = 'error') => {
        setSnackbarMessage(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const showError = (msg: string) => showSnackbar(msg, 'error');

    const handleCloseSnackbar = () => setSnackbarOpen(false);

    const handleNext = () => {
        // Validation Checks
        if (activeStep === 0) {
            const nextErrors = { topic: '', description: '', audience: '' };
            let hasError = false;
            if (!details.topic.trim()) { nextErrors.topic = 'Required'; hasError = true; }
            if (!details.audience.trim()) { nextErrors.audience = 'Required'; hasError = true; }
            if (!details.description.trim()) { nextErrors.description = 'Required'; hasError = true; }

            setDetailsErrors(nextErrors);
            if (hasError) return;
        }

        if (activeStep === 1) {
            const nextUnitErrors = units.map(u => ({
                title: !u.title.trim() ? 'Required' : '',
                description: !u.description.trim() ? 'Required' : '',
                lessons: u.lessons.map(l => ({ title: !l.title.trim() ? 'Required' : '', types: '' }))
            }));

            setUnitsErrors(nextUnitErrors);

            const hasError = nextUnitErrors.some(u => !!u.title || !!u.description || u.lessons.some(l => !!l.title));
            if (hasError) return;
        }

        if (activeStep === 2) {
            const nextUnitErrors = units.map(u => ({
                title: '',
                description: '',
                lessons: u.lessons.map(l => ({ title: '', types: l.types.length === 0 ? 'Select at least one' : '' }))
            }));

            setUnitsErrors(nextUnitErrors);

            const hasError = nextUnitErrors.some(u => u.lessons.some(l => !!l.types));
            if (hasError) {
                showError("Please select at least one question type for every lesson.");
                return;
            }

            // Generate Prompt on transition to Step 3 (Generate)
            const structure: PromptStructure = {
                topic: details.topic,
                description: details.description,
                audience: details.audience,
                units: units.map(u => ({
                    title: u.title,
                    description: u.description,
                    lessons: u.lessons.map(l => ({
                        title: l.title,
                        types: l.types
                    }))
                }))
            };
            setGeneratedPrompt(generateSystemPrompt(structure));
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleImportPreview = (data: PathwayImport) => {
        setPreviewData(data);
        setActiveStep(5); // Move to Preview Step
    };

    const handleSave = async () => {
        if (!previewData) return;
        setIsSaving(true);
        try {
            const result = await saveDraftPathway(previewData);
            if (result && 'error' in result) {
                showError('Failed to save: ' + result.error);
                setIsSaving(false);
            }
            // On success, the server action redirects to /creator
        } catch (e) {
            console.error(e);
        }
    };

    // --- Helper for Structure Step ---
    const addUnit = () => setUnits([...units, { title: `Unit ${units.length + 1}`, description: '', lessons: [] }]);
    const updateUnit = (idx: number, field: string, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const newUnits = [...units];
        newUnits[idx] = { ...newUnits[idx], [field]: value };
        setUnits(newUnits);
    };
    const addLesson = (unitIdx: number) => {
        const newUnits = [...units];
        newUnits[unitIdx].lessons.push({ title: `Lesson ${newUnits[unitIdx].lessons.length + 1}`, types: [] });
        setUnits(newUnits);
    };
    const updateLesson = (unitIdx: number, lessonIdx: number, field: string, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const newUnits = [...units];
        newUnits[unitIdx].lessons[lessonIdx] = { ...newUnits[unitIdx].lessons[lessonIdx], [field]: value };
        setUnits(newUnits);
    };
    const toggleLessonType = (unitIdx: number, lessonIdx: number, type: QuestionType) => {
        const newUnits = [...units];
        // Clear error if selecting
        const newErrors = [...unitsErrors];
        // Safe access in case errors state is not yet initialized for a newly added unit
        if (newErrors[unitIdx] && newErrors[unitIdx].lessons[lessonIdx]) {
            newErrors[unitIdx].lessons[lessonIdx].types = '';
            setUnitsErrors(newErrors);
        }

        const currentTypes = newUnits[unitIdx].lessons[lessonIdx].types;
        if (currentTypes.includes(type)) {
            newUnits[unitIdx].lessons[lessonIdx].types = currentTypes.filter(t => t !== type);
        } else {
            newUnits[unitIdx].lessons[lessonIdx].types = [...currentTypes, type];
        }
        setUnits(newUnits);
    };

    function renderStepContent(step: number) {
        switch (step) {
            case 0: // Details
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Topic" fullWidth value={details.topic}
                            onChange={e => {
                                setDetails({ ...details, topic: e.target.value });
                                setDetailsErrors({ ...detailsErrors, topic: '' });
                            }}
                            error={!!detailsErrors.topic}
                            helperText={detailsErrors.topic}
                        />
                        <TextField
                            label="Target Audience" fullWidth value={details.audience}
                            onChange={e => {
                                setDetails({ ...details, audience: e.target.value });
                                setDetailsErrors({ ...detailsErrors, audience: '' });
                            }}
                            error={!!detailsErrors.audience}
                            helperText={detailsErrors.audience}
                        />
                        <TextField
                            label="Description" fullWidth multiline rows={3} value={details.description}
                            onChange={e => {
                                setDetails({ ...details, description: e.target.value });
                                setDetailsErrors({ ...detailsErrors, description: '' });
                            }}
                            error={!!detailsErrors.description}
                            helperText={detailsErrors.description}
                        />
                    </Box>
                );
            case 1: // Structure
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {units.map((unit, uIdx) => (
                            <Paper key={uIdx} sx={{ p: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <TextField
                                        label="Unit Title" size="small" value={unit.title}
                                        onChange={e => {
                                            updateUnit(uIdx, 'title', e.target.value);
                                            // Reset error locally if needed, but since it's an array based on submit, 
                                            // we might wait for next submit or try to clear it aggressively.
                                            // Simplest is to clear specific error if it exists.
                                            if (unitsErrors[uIdx]?.title) {
                                                const ne = [...unitsErrors];
                                                ne[uIdx].title = '';
                                                setUnitsErrors(ne);
                                            }
                                        }}
                                        error={!!unitsErrors[uIdx]?.title}
                                    />
                                    <TextField
                                        label="Description" size="small" fullWidth value={unit.description}
                                        onChange={e => {
                                            updateUnit(uIdx, 'description', e.target.value);
                                            if (unitsErrors[uIdx]?.description) {
                                                const ne = [...unitsErrors];
                                                ne[uIdx].description = '';
                                                setUnitsErrors(ne);
                                            }
                                        }}
                                        error={!!unitsErrors[uIdx]?.description}
                                    />
                                </Box>
                                <Typography variant="subtitle2" gutterBottom>Lessons</Typography>
                                <Box sx={{ pl: 2 }}>
                                    {unit.lessons.map((lesson, lIdx) => (
                                        <Box key={lIdx} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                                            <TextField
                                                label="Lesson Title" size="small" value={lesson.title}
                                                onChange={e => {
                                                    updateLesson(uIdx, lIdx, 'title', e.target.value);
                                                    if (unitsErrors[uIdx]?.lessons[lIdx]?.title) {
                                                        const ne = [...unitsErrors];
                                                        ne[uIdx].lessons[lIdx].title = '';
                                                        setUnitsErrors(ne);
                                                    }
                                                }}
                                                error={!!unitsErrors[uIdx]?.lessons[lIdx]?.title}
                                                fullWidth
                                            />
                                        </Box>
                                    ))}
                                </Box>
                                <Button size="small" startIcon={<AddIcon />} onClick={() => addLesson(uIdx)} sx={{ mt: 1 }}>Add Lesson</Button>
                            </Paper>
                        ))}
                        <Button startIcon={<AddIcon />} onClick={addUnit} variant="outlined">Add Unit</Button>
                    </Box>
                );
            case 2: // Configuration
                return (
                    <Box>
                        <Typography gutterBottom>Select Question Types for each Lesson:</Typography>
                        {units.map((unit, uIdx) => (
                            <Box key={uIdx} sx={{ mb: 3 }}>
                                <Typography variant="h6">{unit.title}</Typography>
                                {unit.lessons.map((lesson, lIdx) => (
                                    <Paper
                                        key={lIdx}
                                        sx={{
                                            p: 2, ml: 2, mt: 1,
                                            border: unitsErrors[uIdx]?.lessons[lIdx]?.types ? '1px solid red' : undefined // Highlight border for config error
                                        }}
                                    >
                                        <Typography variant="subtitle1" color={unitsErrors[uIdx]?.lessons[lIdx]?.types ? 'error' : 'initial'}>
                                            {lesson.title} {unitsErrors[uIdx]?.lessons[lIdx]?.types && '(Select at least one)'}
                                        </Typography>
                                        <Grid container spacing={1}>
                                            {Object.keys(QuestionTypeRegistry).map((type) => (
                                                <Grid item xs={12} sm={6} md={4} key={type}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={lesson.types.includes(type as QuestionType)}
                                                                onChange={() => toggleLessonType(uIdx, lIdx, type as QuestionType)}
                                                                size="small"
                                                            />
                                                        }
                                                        label={type}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Paper>
                                ))}
                            </Box>
                        ))}
                    </Box>
                );
            case 3: // Generate
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography>Copy this prompt and use it in your LLM:</Typography>
                        <TextField
                            multiline
                            fullWidth
                            rows={10}
                            value={generatedPrompt}
                            InputProps={{ readOnly: true }}
                            sx={{ fontFamily: 'monospace' }}
                        />
                        <Button variant="outlined" onClick={async () => {
                            const success = await copyToClipboard(generatedPrompt);
                            if (success) {
                                showSnackbar('Copied to clipboard!', 'success');
                            } else {
                                showError('Failed to copy to clipboard.');
                            }
                        }}>
                            Copy to Clipboard
                        </Button>
                    </Box>
                );
            case 4: // Import
                return <JsonImporter onImport={handleImportPreview} />;
            case 5: // Preview
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Preview: {previewData?.title}</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>{previewData?.description}</Typography>

                        {previewData?.units?.map((unit, i) => (
                            <Box key={i} sx={{ mb: 4 }}>
                                <Typography variant="subtitle1" fontWeight="bold">{unit.title}</Typography>
                                <Typography variant="body2" gutterBottom>{unit.description}</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {unit.lessons?.map((lesson, j) => (
                                        <Card key={j} variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" fontSize="1rem" gutterBottom>{lesson.title}</Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    {'content' in lesson && lesson.content ? (lesson.content.length > 100 ? lesson.content.substring(0, 100) + '...' : lesson.content) : 'No intro content'}
                                                </Typography>

                                                <Typography variant="caption" sx={{ mt: 1, display: 'block', fontWeight: 'bold' }}>Questions:</Typography>
                                                <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
                                                    {lesson.questions?.map((q: any, k: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                        <li key={k} style={{ marginBottom: '8px' }}>
                                                            <Typography variant="body2" component="div">
                                                                <Chip label={q.type} size="small" sx={{ mr: 1, height: '20px', fontSize: '0.7rem' }} />
                                                                {q.prompt}
                                                            </Typography>
                                                            {q.type === 'multiple-choice' && (
                                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 1 }}>
                                                                    Options: {q.options.join(', ')} • Correct: {q.correctAnswer}
                                                                </Typography>
                                                            )}
                                                            {q.type === 'matching' && (
                                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 1 }}>
                                                                    Pairs: {Object.entries(q.pairs || {}).map(([k, v]) => `${k} -&gt; ${v}`).join(', ')}
                                                                </Typography>
                                                            )}
                                                            {q.type === 'fill-in-the-blank' && (
                                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 1 }}>
                                                                    Answer: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(' or ') : q.correctAnswer}
                                                                </Typography>
                                                            )}
                                                        </li>
                                                    ))}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            </Box>
                        ))}

                        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                            This content is currently in memory. Click &quot;Save Draft&quot; to write it to your library.
                        </Alert>

                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            onClick={handleSave}
                            disabled={isSaving}
                            fullWidth
                        >
                            {isSaving ? 'Saving...' : 'Save Draft'}
                        </Button>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    }

    // Success View (Step 6)
    if (activeStep === 6) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom color="success.main">Success!</Typography>
                <Typography mb={2}>Pathway &quot;{details.topic}&quot; has been saved as a Draft.</Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button variant="contained" onClick={() => router.push('/creator')}>Go to Dashboard</Button>
                    <Button variant="outlined" onClick={() => router.push(`/creator`)}>Preview (via Dashboard)</Button>
                </Box>
            </Paper>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep} orientation="horizontal" sx={{ display: { xs: 'none', md: 'flex' } }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            {/* Mobile Stepper Text */}
            <Typography sx={{ display: { xs: 'block', md: 'none' }, mb: 2, textAlign: 'center' }} variant="subtitle2">
                Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
            </Typography>

            <Box sx={{ mt: 4, mb: 4 }}>
                {renderStepContent(activeStep)}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button color="inherit" disabled={activeStep === 0 || activeStep === 6} onClick={handleBack} sx={{ mr: 1 }}>
                    Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep < 4 && (
                    <Button onClick={handleNext}>
                        Next
                    </Button>
                )}
                {/* Next button hidden on Import and Preview steps as they have specific actions */}
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}


