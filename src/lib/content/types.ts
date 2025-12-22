export type QuestionType = 'multiple-choice' | 'matching' | 'fill-in-the-blank' | 'cloze' | 'ordering' | 'multiple-response' | 'categorize';

export interface ClozeSegment {
    text: string;
    isBlank: boolean;
    id: string;
}

export interface Question {
    id: string;
    type: QuestionType;
    prompt: string;
    options?: string[];
    correctAnswer: string | string[];
    pairs?: { [key: string]: string }; // For matching
    segments?: ClozeSegment[]; // For cloze
    items?: { id: string; text: string }[]; // For ordering and categorize
    correctOrder?: string[]; // For ordering
    correctAnswers?: string[]; // For multiple-response
    categories?: string[]; // For categorize
    correctMapping?: { [itemId: string]: string }; // For categorize
}

export interface ClozeQuestion extends Question {
    type: 'cloze';
    segments: ClozeSegment[];
    options: string[];
}

export interface OrderingQuestion extends Question {
    type: 'ordering';
    items: { id: string; text: string }[];
    correctOrder: string[]; // Array of item IDs in correct order
}

export interface MultipleResponseQuestion extends Question {
    type: 'multiple-response';
    options: string[];
    correctAnswers: string[]; // Array of correct option strings
}

export interface CategorizeQuestion extends Question {
    type: 'categorize';
    items: { id: string; text: string }[];
    categories: string[];
    correctMapping: { [itemId: string]: string }; // ItemId -> CategoryName
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    content: string; // Markdown or HTML content
    questions: Question[];
}

export interface Unit {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
}

export interface Pathway {
    id: string;
    title: string;
    description: string;
    icon?: string; // Emoji or URL
    units: Unit[];
    status?: 'draft' | 'published';
}

export interface ContentPack {
    id: string;
    version: string;
    language: string;
    pathways: Pathway[];
}

export interface UserProfile {
    id: string;
    name: string;
    avatar: string;
    lastLoginDate: string;
}

export type LessonStatus = 'not-started' | 'in-progress' | 'completed';

export interface LessonProgress {
    status: LessonStatus;
    bestScore?: number;
    lastScore?: number;
    currentQuestionIndex?: number;
    currentScore?: number;
}

export interface UserProgress {
    profiles: UserProfile[];
    activeProfileId: string | null;
    lessonStatus: { [lessonId: string]: LessonProgress };
}
