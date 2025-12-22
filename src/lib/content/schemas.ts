import { z } from 'zod';

export const QuestionTypeSchema = z.enum([
    'multiple-choice',
    'matching',
    'fill-in-the-blank',
    'cloze',
    'ordering',
    'multiple-response',
    'categorize'
]);

export const BaseQuestionSchema = z.object({
    id: z.string(),
    type: QuestionTypeSchema,
    prompt: z.string(),
    correctAnswer: z.union([z.string(), z.array(z.string())]),
});

// Import version of Question - ID is optional
export const BaseQuestionImportSchema = z.object({
    id: z.string().optional(),
    type: QuestionTypeSchema,
    prompt: z.string(),
    correctAnswer: z.union([z.string(), z.array(z.string())]).optional(), // Made optional for types that don't use it
});

export const MultipleChoiceQuestionSchema = BaseQuestionSchema.extend({
    type: z.literal('multiple-choice'),
    options: z.array(z.string()),
});
export const MultipleChoiceQuestionImportSchema = BaseQuestionImportSchema.extend({
    type: z.literal('multiple-choice'),
    options: z.array(z.string()),
    correctAnswer: z.union([z.string(), z.array(z.string())]), // Required for MC
});

export const MatchingQuestionSchema = BaseQuestionSchema.extend({
    type: z.literal('matching'),
    pairs: z.record(z.string(), z.string()),
});
export const MatchingQuestionImportSchema = BaseQuestionImportSchema.extend({
    type: z.literal('matching'),
    pairs: z.record(z.string(), z.string()),
});

export const ClozeSegmentSchema = z.object({
    text: z.string(),
    isBlank: z.boolean(),
    id: z.string()
});
// Cloze segments need IDs usually for keying, but maybe we can generate them? 
// For now, let's keep requiring them or make them optional too if complex.
// The fallback is usually index-based.
export const ClozeSegmentImportSchema = z.object({
    text: z.string(),
    isBlank: z.boolean(),
    id: z.string().optional()
});

export const ClozeQuestionSchema = BaseQuestionSchema.extend({
    type: z.literal('cloze'),
    segments: z.array(ClozeSegmentSchema),
    options: z.array(z.string()),
});
export const ClozeQuestionImportSchema = BaseQuestionImportSchema.extend({
    type: z.literal('cloze'),
    segments: z.array(ClozeSegmentImportSchema),
    options: z.array(z.string()),
});

export const OrderingQuestionSchema = BaseQuestionSchema.extend({
    type: z.literal('ordering'),
    items: z.array(z.object({ id: z.string(), text: z.string() })),
    correctOrder: z.array(z.string()),
});
export const OrderingQuestionImportSchema = BaseQuestionImportSchema.extend({
    type: z.literal('ordering'),
    items: z.array(z.object({ id: z.string().optional(), text: z.string() })),
    correctOrder: z.array(z.string()), // This relies on IDs... if IDs are optional in items, they must be present to define order?
    // Ordering questions are complex. The Prompt Generator doesn't explicitly explain how to link them without IDs.
    // For now, assuming user will provide IDs if using Ordering, OR we keep it strict for Ordering.
});


export const MultipleResponseQuestionSchema = BaseQuestionSchema.extend({
    type: z.literal('multiple-response'),
    options: z.array(z.string()),
    correctAnswers: z.array(z.string()),
});
export const MultipleResponseQuestionImportSchema = BaseQuestionImportSchema.extend({
    type: z.literal('multiple-response'),
    options: z.array(z.string()),
    correctAnswers: z.array(z.string()),
});

export const CategorizeQuestionSchema = BaseQuestionSchema.extend({
    type: z.literal('categorize'),
    items: z.array(z.object({ id: z.string(), text: z.string() })),
    categories: z.array(z.string()),
    correctMapping: z.record(z.string(), z.string()),
});
export const CategorizeQuestionImportSchema = BaseQuestionImportSchema.extend({
    type: z.literal('categorize'),
    items: z.array(z.object({ id: z.string().optional(), text: z.string() })),
    categories: z.array(z.string()),
    correctMapping: z.record(z.string(), z.string()),
});


// Discriminated Union for granular validation
export const QuestionSchema = z.discriminatedUnion('type', [
    MultipleChoiceQuestionSchema,
    MatchingQuestionSchema,
    ClozeQuestionSchema,
    OrderingQuestionSchema,
    MultipleResponseQuestionSchema,
    CategorizeQuestionSchema,
    BaseQuestionSchema.extend({ type: z.literal('fill-in-the-blank') })
]);

export const QuestionImportSchema = z.discriminatedUnion('type', [
    MultipleChoiceQuestionImportSchema,
    MatchingQuestionImportSchema,
    ClozeQuestionImportSchema,
    OrderingQuestionImportSchema,
    MultipleResponseQuestionImportSchema,
    CategorizeQuestionImportSchema,
    BaseQuestionImportSchema.extend({ type: z.literal('fill-in-the-blank'), correctAnswer: z.union([z.string(), z.array(z.string())]) })
]);


export const LessonSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    content: z.string(),
    questions: z.array(QuestionSchema),
});

export const LessonImportSchema = z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(), // LLM sometimes omits
    content: z.string().optional(),
    questions: z.array(QuestionImportSchema),
});

export const UnitSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    lessons: z.array(LessonSchema).optional(),
});

// Schema for the "Full Import" format the LLM will generate
// IDs here are optional and will be generated if missing
export const PathwayImportSchema = z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    units: z.array(z.object({
        id: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
        lessons: z.array(LessonImportSchema)
    }))
});
