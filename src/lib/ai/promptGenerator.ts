import { QuestionType } from '@/lib/content/types';

interface QuestionTypeConfigEntry {
    description: string;
    schemaDescription: string;
    example?: string;
}

export const QuestionTypeRegistry: Record<QuestionType, QuestionTypeConfigEntry> = {
    'multiple-choice': {
        description: "Standard multiple choice question.",
        schemaDescription: "Requires 'options' (array of strings) and 'correctAnswer' (string which must match one of the options).",
        example: `{ "type": "multiple-choice", "prompt": "What is 2+2?", "options": ["3", "4", "5"], "correctAnswer": "4", "explanation": "2 plus 2 equals 4. Basic arithmetic." }`
    },
    'matching': {
        description: "Match keys to values.",
        schemaDescription: "Requires 'pairs' (object where keys vary and values are matches).",
        example: `{ "type": "matching", "prompt": "Match the capitals", "pairs": { "France": "Paris", "Germany": "Berlin" }, "explanation": "Paris is the capital of France, Berlin is the capital of Germany." }`
    },
    'fill-in-the-blank': {
        description: "User must type the answer manually. Good for vocabulary or specific terms.",
        schemaDescription: "Requires 'correctAnswer' (string or array of acceptable strings).",
        example: `{ "type": "fill-in-the-blank", "prompt": "What is the capital of France?", "correctAnswer": "Paris", "explanation": "Paris is the capital and most populous city of France." }`
    },
    'cloze': {
        description: "Fill in the blanks within a sentence.",
        schemaDescription: "Requires 'segments' (array of objects with 'text', 'isBlank', 'id').",
        example: `{ "type": "cloze", "prompt": "Complete the sentence regarding the sky.", "segments": [{ "text": "The sky is ", "isBlank": false, "id": "1" }, { "text": "blue", "isBlank": true, "id": "2" }], "options": ["blue", "green"], "explanation": "The sky appears blue due to Rayleigh scattering." }`
    },
    'ordering': {
        description: "Arrange items in correct sequence.",
        schemaDescription: "Requires 'items' (array with ids and text) and 'correctOrder' (array of ids).",
        example: `{ "type": "ordering", "prompt": "Order the meals of the day", "items": [{ "id": "1", "text": "Dinner" }, { "id": "2", "text": "Breakfast" }], "correctOrder": ["2", "1"], "explanation": "Breakfast comes first in the morning, followed by Dinner in the evening." }`
    },
    'multiple-response': {
        description: "Select all correct options.",
        schemaDescription: "Requires 'options' and 'correctAnswers' (array).",
        example: `{ "type": "multiple-response", "prompt": "Select primary colors", "options": ["Red", "Green", "Blue", "Yellow"], "correctAnswers": ["Red", "Blue", "Yellow"], "explanation": "Red, Blue, and Yellow are the three primary pigment colors." }`
    },
    'categorize': {
        description: "Sort items into categories.",
        schemaDescription: "Requires 'items', 'categories', and 'correctMapping' (itemId -> category).",
        example: `{ "type": "categorize", "prompt": "Sort animals", "items": [{ "id": "1", "text": "Cat" }, { "id": "2", "text": "Eagle" }], "categories": ["Mammal", "Bird"], "correctMapping": { "1": "Mammal", "2": "Bird" }, "explanation": "Cats are mammals, Eagles are birds." }`
    }
};

export interface PromptStructure {
    topic: string;
    description: string;
    audience: string;
    units: {
        title: string;
        description: string;
        lessons: {
            title: string;
            types: QuestionType[];
            count?: number;
        }[];
    }[];
}

export function generateSystemPrompt(structure: PromptStructure): string {
    const usedTypes = new Set<QuestionType>();

    // Collect all used types
    structure.units.forEach(u => u.lessons.forEach(l => l.types.forEach(t => usedTypes.add(t))));

    let prompt = `You are an expert educator specializing in creating interactive course content.
Your task is to generate a structured JSON object for a new learning pathway.

**Topic**: ${structure.topic}
**Target Audience**: ${structure.audience}
**Description**: ${structure.description}

### Output Structure
You must output a single valid JSON object strictly matching this TypeScript-like schema:

\`\`\`typescript
interface PathwayImport {
  title: string;
  description: string; // The specific description provided above
  units: {
    title: string;
    description: string;
    lessons: {
      title: string;
      description: string; // Brief pedagogical goal
      content: string; // Short introductory text/markdown for the lesson
      questions: Question[]; // See Question Types below. All questions should include an "explanation".
    }[];
  }[];
}
\`\`\`

### Content Requirements
`;

    structure.units.forEach((unit, uIdx) => {
        prompt += `\nUnit ${uIdx + 1}: ${unit.title}\nDescription: ${unit.description}\n`;
        unit.lessons.forEach((lesson, lIdx) => {
            prompt += `  - Lesson ${lIdx + 1}: "${lesson.title}"\n`;
            prompt += `    - Question Types: ${lesson.types.join(', ')}\n`;
            if (lesson.count) {
                prompt += `    - Quantity: Approximately ${lesson.count} questions.\n`;
            }
        });
    });

    prompt += `\n### Question Types Specification\nFor each question, the 'type' field determines the required structure:\n`;

    Array.from(usedTypes).forEach(type => {
        const config = QuestionTypeRegistry[type];
        if (config) {
            prompt += `\n**${type}**:\n - ${config.description}\n - Schema: ${config.schemaDescription}\n`;
            if (config.example) {
                prompt += ` - Example: ${config.example}\n`;
            }
        }
    });

    prompt += `\n\n**CRITICAL INSTRUCTIONS**:\n1. Return ONLY the JSON object. No markdown formatting (like \`\`\`json). \n2. Ensure all IDs (unit keys, lesson keys, question ids) are unique strings.\n3. The content must be pedagogical, accurate, and suitable for the defined audience.\n4. **Mandatory**: Include a concise "explanation" field for every question explaining why the answer is correct.`;

    return prompt;
}
