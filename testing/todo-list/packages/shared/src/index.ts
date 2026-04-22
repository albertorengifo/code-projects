import { z } from "zod";

export const todoItemSchema = z.object({
  id: z.number().int().nonnegative(),
  title: z.string().min(1),
  category: z.string().min(1),
  accentColor: z.string().min(1),
  priorityLabel: z.string().min(1),
  completed: z.boolean()
});

export const todosResponseSchema = z.object({
  todos: z.array(todoItemSchema)
});

export const todoMutationSchema = z.object({
  title: z.string().trim().min(1),
  category: z.string().trim().min(1),
  accentColor: z.string().trim().min(1),
  priorityLabel: z.string().trim().min(1),
  completed: z.boolean()
});

export const todoResponseSchema = z.object({
  todo: todoItemSchema
});

export const guideIntentionSchema = z.enum(["discipline", "glory", "wisdom", "endurance"]);

export const guideChatRequestSchema = z.object({
  message: z.string().trim().min(1),
  intention: guideIntentionSchema,
  todos: z.array(todoItemSchema)
});

export const guideChatResponseSchema = z.object({
  reply: z.string().min(1)
});

export type TodoItem = z.infer<typeof todoItemSchema>;
export type TodosResponse = z.infer<typeof todosResponseSchema>;
export type TodoMutation = z.infer<typeof todoMutationSchema>;
export type TodoResponse = z.infer<typeof todoResponseSchema>;
export type GuideIntention = z.infer<typeof guideIntentionSchema>;
export type GuideChatRequest = z.infer<typeof guideChatRequestSchema>;
export type GuideChatResponse = z.infer<typeof guideChatResponseSchema>;
