import cors from "cors";
import express from "express";
import { initializeDatabase } from "./db.js";
import { createTodo, deleteTodo, listTodos, updateTodo } from "./todoRepository.js";
import {
  guideChatRequestSchema,
  guideChatResponseSchema,
  todoMutationSchema,
  todoResponseSchema,
  todosResponseSchema,
  type GuideChatRequest,
  type TodoItem
} from "@todo-list/shared";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
const ollamaModel = process.env.OLLAMA_MODEL ?? "llama3.2:3b";

function buildGuideSystemPrompt(payload: GuideChatRequest) {
  const incompleteTodos = payload.todos.filter((todo) => !todo.completed);
  const completedTodos = payload.todos.filter((todo) => todo.completed);
  const todoSummary = payload.todos
    .map(
      (todo: TodoItem) =>
        `- [${todo.completed ? "x" : " "}] ${todo.title} | category=${todo.category} | priority=${todo.priorityLabel} | accent=${todo.accentColor}`
    )
    .join("\n");

  return [
    "You are Dragon Guide, a witty open-source assistant for a Nordic fantasy todo app.",
    "Address the user like a heroic chosen one, Dragonborn, Dovahkiin, or slayer of dragons.",
    "Be warm, playful, and slightly theatrical, but still useful and concise.",
    "Ground your answer in the provided todo list and the selected intention. Do not invent missing tasks.",
    "Prefer 2-4 sentences.",
    "Offer specific prioritization advice when possible.",
    "Never mention that you are pretending or roleplaying.",
    `Selected intention: ${payload.intention}.`,
    `Active quests: ${incompleteTodos.length}. Completed quests: ${completedTodos.length}.`,
    "Current quest log:",
    todoSummary || "- No tasks yet."
  ].join("\n");
}

function buildFallbackGuideReply(payload: GuideChatRequest) {
  const incompleteTodos = payload.todos.filter((todo) => !todo.completed);
  const completedTodos = payload.todos.filter((todo) => todo.completed);
  const nextTodo = incompleteTodos[0];
  const normalizedMessage = payload.message.toLowerCase();

  if (normalizedMessage.includes("next") || normalizedMessage.includes("what should i do")) {
    return nextTodo
      ? `Dragonborn, take up "${nextTodo.title}" first. The nearest unfinished quest is often the cleanest strike.`
      : "Dragonborn, your quest log stands clear. Add a new task and I shall name your next worthy challenge.";
  }

  if (normalizedMessage.includes("progress") || normalizedMessage.includes("completed")) {
    return `You have ${completedTodos.length} completed quest${completedTodos.length === 1 ? "" : "s"} and ${incompleteTodos.length} still before you. Even the Greybeards respect steady progress.`;
  }

  if (normalizedMessage.includes("overwhelmed") || normalizedMessage.includes("stuck") || normalizedMessage.includes("focus")) {
    return nextTodo
      ? `Then narrow your gaze, Dovahkiin. Ignore the noise and begin with "${nextTodo.title}" before doubt can loose its arrows.`
      : "Your burden is light, Dragonborn. Choose a single worthy task and let momentum answer the rest.";
  }

  return `By the rune of ${payload.intention}, I say this: choose one clear task, keep your blade on the present moment, and let finished duties become your legend.`;
}

async function askOllama(payload: GuideChatRequest) {
  const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: ollamaModel,
      stream: false,
      messages: [
        {
          role: "system",
          content: buildGuideSystemPrompt(payload)
        },
        {
          role: "user",
          content: payload.message
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { message?: { content?: string } };
  const reply = data.message?.content?.trim();

  if (!reply) {
    throw new Error("Ollama returned an empty reply");
  }

  return reply;
}

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/todos", async (_request, response, next) => {
  try {
    const todos = await listTodos();
    const payload = todosResponseSchema.parse({ todos });

    response.json(payload);
  } catch (error) {
    next(error);
  }
});

app.post("/api/todos", async (request, response, next) => {
  try {
    const input = todoMutationSchema.parse(request.body);
    const todo = await createTodo(input);
    const payload = todoResponseSchema.parse({ todo });

    response.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

app.put("/api/todos/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id < 0) {
      response.status(400).json({ message: "Invalid todo id" });
      return;
    }

    const input = todoMutationSchema.parse(request.body);
    const todo = await updateTodo(id, input);

    if (!todo) {
      response.status(404).json({ message: "Todo not found" });
      return;
    }

    const payload = todoResponseSchema.parse({ todo });
    response.json(payload);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/todos/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id < 0) {
      response.status(400).json({ message: "Invalid todo id" });
      return;
    }

    const deleted = await deleteTodo(id);
    if (!deleted) {
      response.status(404).json({ message: "Todo not found" });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.post("/api/guide/chat", async (request, response, next) => {
  try {
    const payload = guideChatRequestSchema.parse(request.body);
    let reply: string;

    try {
      reply = await askOllama(payload);
    } catch {
      reply = buildFallbackGuideReply(payload);
    }

    response.json(guideChatResponseSchema.parse({ reply }));
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  response.status(500).json({ message });
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize SQLite database", error);
    process.exit(1);
  });
