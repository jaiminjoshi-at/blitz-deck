
import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    boolean,
    uuid,
    pgEnum,
    jsonb,
} from "drizzle-orm/pg-core";
import { start } from "repl";
import type { AdapterAccountType } from "next-auth/adapters";

export const roleEnum = pgEnum("role", ["admin", "learner"]);

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    password: text("password"),
    role: roleEnum("role").default("learner").notNull(),
    assignedAdminId: text("assignedAdminId"), // For learners, points to their admin
});

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    ]
);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => [
        primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    ]
);

// --- CONTENT SCHEMA ---

export const pathways = pgTable("pathway", {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: text("creatorId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }), // Admin who created it
    title: text("title").notNull(),
    description: text("description"),
    published: boolean("published").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const units = pgTable("unit", {
    id: uuid("id").defaultRandom().primaryKey(),
    pathwayId: uuid("pathwayId")
        .notNull()
        .references(() => pathways.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    order: integer("order").notNull(), // To order units within a pathway
});

export const lessons = pgTable("lesson", {
    id: uuid("id").defaultRandom().primaryKey(),
    unitId: uuid("unitId")
        .notNull()
        .references(() => units.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    order: integer("order").notNull(),
    learningContent: text("learning_content"), // Markdown or HTML content for the lesson intro
});

export const questions = pgTable("question", {
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: uuid("lessonId")
        .notNull()
        .references(() => lessons.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'multiple-choice', 'fill-gap', etc.
    prompt: text("prompt").notNull(),
    data: jsonb("data").notNull(), // Flexible storage for options, correct answers, etc.
    order: integer("order").notNull(),
});

// --- USER PROGRESS ---
// (Simple version for now)

export const userProgress = pgTable("user_progress", {
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lessonId")
        .notNull()
        .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at").defaultNow(),
    score: integer("score"),
    bestScore: integer("best_score"),
    lastScore: integer("last_score"),
    bestTime: integer("best_time"),
    lastTime: integer("last_time"),
}, (t) => [
    primaryKey({ columns: [t.userId, t.lessonId] })
]);

// --- RELATIONS ---

import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ one, many }) => ({
    createdPathways: many(pathways, { relationName: "creator" }),
    learners: many(users, { relationName: "admin" }),
    admin: one(users, {
        fields: [users.assignedAdminId],
        references: [users.id],
        relationName: "admin",
    }),
}));

export const pathwaysRelations = relations(pathways, ({ one, many }) => ({
    creator: one(users, {
        fields: [pathways.creatorId],
        references: [users.id],
        relationName: "creator",
    }),
    units: many(units),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
    pathway: one(pathways, {
        fields: [units.pathwayId],
        references: [pathways.id],
    }),
    lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    unit: one(units, {
        fields: [lessons.unitId],
        references: [units.id],
    }),
    questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
    lesson: one(lessons, {
        fields: [questions.lessonId],
        references: [lessons.id],
    }),
}));
