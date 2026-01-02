
import { Question, Lesson, QuestionType } from "./types";

// DB Types (simplified representation)
interface DBQuestion {
    id: string;
    type: string;
    prompt: string;
    data: unknown; // JSONB
    order: number;
}

interface DBLesson {
    id: string;
    title: string;
    description: string | null;
    learningContent: string | null;
    questions: DBQuestion[];
}

export function mapDBLessonToQuizLesson(dbLesson: DBLesson): Lesson {
    return {
        id: dbLesson.id,
        title: dbLesson.title,
        description: dbLesson.description || "",
        content: dbLesson.learningContent || "",
        questions: dbLesson.questions.map(mapDBQuestionToQuizQuestion)
    };
}

function mapDBQuestionToQuizQuestion(dbQuestion: DBQuestion): Question {
    const data = dbQuestion.data as Partial<Question>;

    // Base Question
    const base: Question = {
        id: dbQuestion.id,
        type: dbQuestion.type as QuestionType,
        prompt: dbQuestion.prompt,
        explanation: data.explanation,
        correctAnswer: data.correctAnswer || "", // Default if missing
    };

    // Merge strategy based on type implementation in the actual UI components
    // The current UI simply expects properties to be on the object.
    // So we spread data onto the base.

    // Ideally we would validate per-type here.
    return {
        ...base,
        ...data,
        correctAnswer: data.correctAnswer // ensure it overrides base if present in data
    } as Question;
}
