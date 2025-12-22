'use client';
import * as React from 'react';
import { CategorizeQuestion as CategorizeQuestionType } from '@/lib/content/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
    question: CategorizeQuestionType;
    onAnswer: (isCorrect: boolean) => void;
}

function SortableItem(props: { id: string; text: string; disabled: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id, disabled: props.disabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            sx={{
                p: 1.5,
                mb: 1,
                bgcolor: 'background.paper',
                cursor: props.disabled ? 'default' : 'grab',
                '&:active': { cursor: props.disabled ? 'default' : 'grabbing' },
                border: 1,
                borderColor: 'divider',
                userSelect: 'none'
            }}
            {...attributes}
            {...listeners}
        >
            <Typography variant="body2">{props.text}</Typography>
        </Paper>
    );
}

function DroppableContainer(props: { id: string; title: string; items: { id: string; text: string }[]; disabled: boolean; isCorrect?: boolean; isIncorrect?: boolean }) {
    // Using SortableContext inside to allow reordering/dropping
    const { setNodeRef } = useSortable({ id: props.id, disabled: props.disabled, data: { type: 'container' } });

    let bgcolor = 'background.default';
    if (props.isCorrect) bgcolor = 'success.light';
    if (props.isIncorrect) bgcolor = 'error.light';

    return (
        <Paper
            ref={setNodeRef}
            sx={{
                p: 2,
                height: '100%',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                bgcolor,
                transition: 'background-color 0.3s'
            }}
        >
            <Typography variant="subtitle2" gutterBottom fontWeight="bold" align="center" sx={{ mb: 2 }}>
                {props.title}
            </Typography>
            <SortableContext items={props.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <Box sx={{ flexGrow: 1 }}>
                    {props.items.map((item) => (
                        <SortableItem key={item.id} id={item.id} text={item.text} disabled={props.disabled} />
                    ))}
                </Box>
            </SortableContext>
        </Paper>
    );
}

export default function CategorizeQuestion({ question, onAnswer }: Props) {
    // State: mapping of containerId -> array of items
    const [items, setItems] = React.useState<{ [key: string]: { id: string; text: string }[] }>({
        pool: [],
    });
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const [submitted, setSubmitted] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState(false);
    const [attempts, setAttempts] = React.useState(0);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    React.useEffect(() => {
        // Initialize: All items in 'pool', categories empty
        const initialItems: { [key: string]: { id: string; text: string }[] } = {
            pool: [...question.items], // Start all in pool
        };
        question.categories.forEach(cat => {
            initialItems[cat] = [];
        });

        // Loop to ensure categories exist as keys even if empty
        setItems(initialItems);
        setSubmitted(false);
        setIsCorrect(false);
        setAttempts(0);
    }, [question]);

    function findContainer(id: string): string | undefined {
        if (id in items) return id;
        return Object.keys(items).find((key) => items[key].find((i) => i.id === id));
    }

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) return;

        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(overId as string);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setItems((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.findIndex((i) => i.id === active.id);
            const overIndex = overItems.findIndex((i) => i.id === overId);

            let newIndex;
            if (overId in prev) {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter((item) => item.id !== active.id),
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length),
                ],
            };
        });
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(over?.id as string);

        if (
            activeContainer &&
            overContainer &&
            activeContainer === overContainer
        ) {
            const activeIndex = items[activeContainer].findIndex((i) => i.id === active.id);
            const overIndex = items[overContainer].findIndex((i) => i.id === over?.id);

            if (activeIndex !== overIndex) {
                setItems((prev) => ({
                    ...prev,
                    [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
                }));
            }
        }

        setActiveId(null);
        setSubmitted(false);
    }

    const handleSubmit = () => {
        // Validate:
        // 1. Pool must be empty (all items categorized)? Or maybe not enforced, but implied wrong if not.
        // 2. Check each item in each category against correctMapping.

        // Let's enforce that checking works even if pool is not empty (just marked wrong).

        let correct = true;

        // Check every item's location
        question.items.forEach(item => {
            const correctCategory = question.correctMapping[item.id];
            const currentContainer = findContainer(item.id);

            if (currentContainer !== correctCategory) {
                correct = false;
            }
        });

        setSubmitted(true);
        setIsCorrect(correct);

        if (correct) {
            onAnswer(true);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= 2) {
                onAnswer(false);
            }
        }
    };

    const isFailed = attempts >= 2 && !isCorrect;

    const draggingItem = activeId ? (Object.values(items).flat().find(i => i.id === activeId) || null) : null;

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>{question.prompt}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>Drag items to the correct category.</Typography>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <Grid container spacing={3}>
                    {/* Pool Section - Left/Top */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ p: 2, border: '1px dashed', borderColor: 'text.disabled', borderRadius: 1, maxHeight: 600, overflowY: 'auto' }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, p: 1, mt: -1, mx: -1 }}>ITEMS TO CATEGORIZE</Typography>
                            <DroppableContainer
                                id="pool"
                                title=""
                                items={items.pool}
                                disabled={submitted && (isCorrect || isFailed)}
                            />
                        </Box>
                    </Grid>

                    {/* Categories Section - Right/Bottom */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Grid container spacing={2}>
                            {question.categories.map((cat) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat}>
                                    <DroppableContainer
                                        id={cat}
                                        title={cat}
                                        items={items[cat] || []}
                                        disabled={submitted && (isCorrect || isFailed)}
                                        isCorrect={submitted && isCorrect}
                                        isIncorrect={submitted && !isCorrect && isFailed && true}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>

                <DragOverlay>
                    {draggingItem ? <Paper sx={{ p: 1.5, maxWidth: 200 }}><Typography variant="body2">{draggingItem.text}</Typography></Paper> : null}
                </DragOverlay>
            </DndContext>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    size="large"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitted && (isCorrect || isFailed)}
                    sx={{ minWidth: 120, py: 1 }}
                >
                    {submitted && isFailed ? 'Next' : (submitted && !isCorrect ? 'Try Again' : 'Check Answer')}
                </Button>
            </Box>

            {submitted && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography
                        variant="h6"
                        color={isCorrect ? 'success.main' : 'error.main'}
                    >
                        {isCorrect
                            ? 'Correct!'
                            : isFailed
                                ? 'Incorrect.'
                                : 'Incorrect, try again.'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
