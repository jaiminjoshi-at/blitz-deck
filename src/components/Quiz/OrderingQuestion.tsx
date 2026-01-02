'use client';
import * as React from 'react';
import { OrderingQuestion as OrderingQuestionType, UserAnswer } from '@/lib/content/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface Props {
    question: OrderingQuestionType;
    onAnswer: (isCorrect: boolean, userAnswer: UserAnswer) => void;
}

function SortableItem(props: {
    id: string;
    text: string;
    disabled: boolean;
    isCorrect?: boolean;
    isIncorrect?: boolean;
}) {
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

    let bgcolor = 'background.paper';
    if (props.isCorrect) bgcolor = 'success.light';
    else if (props.isIncorrect) bgcolor = 'error.light';

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            sx={{
                p: 2,
                mb: 1,
                bgcolor,
                display: 'flex',
                alignItems: 'center',
                cursor: props.disabled ? 'default' : 'grab',
                '&:active': { cursor: props.disabled ? 'default' : 'grabbing' },
            }}
            {...attributes}
            {...listeners}
        >
            <Box sx={{ mr: 2, color: 'text.secondary', display: 'flex' }}>
                <DragIndicatorIcon />
            </Box>
            <Typography variant="body1">{props.text}</Typography>
        </Paper>
    );
}

export default function OrderingQuestion({ question, onAnswer }: Props) {
    const [items, setItems] = React.useState<{ id: string; text: string }[]>([]);
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
        // Init with provided items. Ideally these are shuffled by the caller or we shuffle here.
        // For ordering questions, usually the generic "content" comes in correct order in some systems, 
        // but here we likely define them in "items" attribute. 
        // If "items" in JSON is the *presentation* order, we just use it. 
        // If we want to ensure random start, we shuffle.
        // Let's shuffle to be safe, unless it's already shuffled in JSON. 
        // Safest is to shuffle.
        const initialItems = [...question.items];
        // Fisher-Yates shuffle
        for (let i = initialItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [initialItems[i], initialItems[j]] = [initialItems[j], initialItems[i]];
        }
        setItems(initialItems);
        setSubmitted(false);
        setIsCorrect(false);
        setAttempts(0);
    }, [question]);

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
            setSubmitted(false); // Clear result on valid interaction
        }
    }

    const handleSubmit = () => {
        const currentOrderIds = items.map(item => item.id);
        const correctOrderIds = question.correctOrder;

        // Check exact match
        const correct = JSON.stringify(currentOrderIds) === JSON.stringify(correctOrderIds);

        setSubmitted(true);
        setIsCorrect(correct);

        if (correct) {
            onAnswer(true, currentOrderIds);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= 2) {
                onAnswer(false, currentOrderIds);
            }
        }
    };

    const isFailed = attempts >= 2 && !isCorrect;

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>{question.prompt}</Typography>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
                        {items.map((item) => (
                            <SortableItem
                                key={item.id}
                                id={item.id}
                                text={item.text}
                                disabled={submitted && (isCorrect || isFailed)}
                                isCorrect={submitted && isCorrect}
                                isIncorrect={submitted && !isCorrect && isFailed} // Mark all red if failed
                            />
                        ))}
                    </Box>
                </SortableContext>
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
                            ? 'Correct Order!'
                            : isFailed
                                ? 'Use the order below as a guide.'
                                : 'Incorrect, try again.'}
                    </Typography>

                    {isFailed && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1, textAlign: 'left' }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Correct Order:</Typography>
                            <List dense>
                                {question.correctOrder.map((id, index) => {
                                    const item = question.items.find(i => i.id === id);
                                    return (
                                        <ListItem key={id} disablePadding>
                                            <ListItemText
                                                primary={`${index + 1}. ${item?.text || 'Unknown'}`}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}
