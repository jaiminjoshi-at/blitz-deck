const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '../src/content/packs/german-intermediate-vienna-v1/vienna-pathway-1/unit-wien-alltag');
const METADATA_PATH = path.join(TARGET_DIR, 'metadata.json');

const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf-8'));

console.log('Original lessons:', metadata.lessons.length);

const NEW_LESSON_COUNT = 18;

for (let i = 1; i <= NEW_LESSON_COUNT; i++) {
    const lessonId = `mock-lesson-${i}`;
    const lessonContent = {
        id: lessonId,
        title: `Mock Lesson ${i}`,
        description: `This is a generated mock lesson ${i} for layout testing.`,
        content: "Lorem ipsum content.",
        questions: [
            {
                id: "q1",
                type: "multiple-choice",
                prompt: "Is this a mock lesson?",
                options: ["Yes", "No"],
                correctAnswer: "Yes"
            }
        ]
    };

    fs.writeFileSync(path.join(TARGET_DIR, `${lessonId}.json`), JSON.stringify(lessonContent, null, 2));

    if (!metadata.lessons.includes(lessonId)) {
        metadata.lessons.push(lessonId);
    }
}

fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));

console.log(`Generated ${NEW_LESSON_COUNT} mock lessons.`);
console.log('Total lessons now:', metadata.lessons.length);
