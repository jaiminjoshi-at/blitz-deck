export type QuestionType = 'multiple-choice' | 'matching' | 'fill-in-the-blank';

export interface Question {
    id: string;
    type: QuestionType;
    prompt: string;
    options?: string[];
    correctAnswer: string | string[];
    pairs?: { [key: string]: string }; // For matching
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
}

export interface UserProgress {
    profiles: UserProfile[];
    activeProfileId: string | null;
    lessonStatus: { [lessonId: string]: LessonProgress };
}
