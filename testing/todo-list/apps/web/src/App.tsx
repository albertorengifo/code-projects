import { useEffect, useState } from "react";
import {
  guideChatResponseSchema,
  todoMutationSchema,
  todoResponseSchema,
  todosResponseSchema,
  type GuideIntention,
  type TodoItem,
  type TodoMutation
} from "@todo-list/shared";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const intentions = [
  { id: "discipline", title: "Discipline", rune: "I", summary: "Cut through unfinished work and build momentum." },
  { id: "glory", title: "Glory", rune: "II", summary: "Choose the task that will feel most triumphant to finish." },
  { id: "wisdom", title: "Wisdom", rune: "III", summary: "Bring order to the quest log before charging ahead." },
  { id: "endurance", title: "Endurance", rune: "IV", summary: "Favor steady progress over dramatic bursts." }
] as const;

type GuideMessage = {
  id: number;
  speaker: "guide" | "hero";
  text: string;
};

const emptyFormState: TodoMutation = {
  title: "",
  category: "",
  accentColor: "#FF7A59",
  priorityLabel: "Today",
  completed: false
};

type EditorState =
  | { mode: "create" }
  | { mode: "edit"; todo: TodoItem }
  | null;

function buildGuidanceForIntention(intention: GuideIntention, todos: TodoItem[]) {
  const incompleteTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);
  const nextTodo = incompleteTodos[0];

  if (intention === "discipline") {
    return nextTodo
      ? `Dragonborn, begin with "${nextTodo.title}". The first unfinished quest is the clearest path to momentum.`
      : "Dragonborn, your quest log is clear. Hold your ground and choose a fresh objective worthy of your name.";
  }

  if (intention === "glory") {
    const spotlightTodo = [...incompleteTodos].sort((left, right) => left.title.length - right.title.length)[0];
    return spotlightTodo
      ? `Chosen one, seize "${spotlightTodo.title}". A swift victory will echo like a shout through the hall.`
      : "Chosen one, no unclaimed glory remains. Mark a new challenge and let the banners rise again.";
  }

  if (intention === "wisdom") {
    return `Dragonborn, you carry ${incompleteTodos.length} active quests and ${completedTodos.length} completed deeds. Let the list tell you where order is missing.`;
  }

  return incompleteTodos.length > 2
    ? "Dovahkiin, too many quests divide your strength. Complete one small task before accepting another."
    : "Dovahkiin, your burden is balanced. Advance with calm steps and protect your energy for the longer road.";
}

export default function App() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [formState, setFormState] = useState<TodoMutation>(emptyFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIntention, setSelectedIntention] = useState<GuideIntention>("discipline");
  const [chatInput, setChatInput] = useState("");
  const [isConsultingGuide, setIsConsultingGuide] = useState(false);
  const [guideMessages, setGuideMessages] = useState<GuideMessage[]>([
    {
      id: 1,
      speaker: "guide",
      text: "Dragonborn, I am your Dragon Guide. Choose an intention in the rune circle, then ask for counsel and I will read your quest log through the voice of a local model."
    }
  ]);

  async function loadTodos() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/todos`);
      if (!response.ok) {
        throw new Error("Unable to load the todo list right now.");
      }

      const payload = todosResponseSchema.parse(await response.json());
      setTodos(payload.todos);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTodos();
  }, []);

  function openCreateModal() {
    setEditorState({ mode: "create" });
    setFormState(emptyFormState);
  }

  function openEditModal(todo: TodoItem) {
    setEditorState({ mode: "edit", todo });
    setFormState({
      title: todo.title,
      category: todo.category,
      accentColor: todo.accentColor,
      priorityLabel: todo.priorityLabel,
      completed: todo.completed
    });
  }

  function closeModal() {
    setEditorState(null);
    setFormState(emptyFormState);
  }

  function updateForm<Field extends keyof TodoMutation>(field: Field, value: TodoMutation[Field]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function addGuideMessage(speaker: GuideMessage["speaker"], text: string) {
    setGuideMessages((current) => [...current, { id: current.length + 1, speaker, text }]);
  }

  function chooseIntention(intention: GuideIntention) {
    setSelectedIntention(intention);
    addGuideMessage("guide", buildGuidanceForIntention(intention, todos));
  }

  async function handleGuideSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedInput = chatInput.trim();
    if (!trimmedInput) {
      return;
    }

    addGuideMessage("hero", trimmedInput);
    setChatInput("");

    try {
      setIsConsultingGuide(true);

      const response = await fetch(`${apiBaseUrl}/api/guide/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmedInput,
          intention: selectedIntention,
          todos
        })
      });

      if (!response.ok) {
        throw new Error("The Greybeards are silent right now. Try again in a moment.");
      }

      const payload = guideChatResponseSchema.parse(await response.json());
      addGuideMessage("guide", payload.reply);
    } catch (guideError) {
      const message = guideError instanceof Error ? guideError.message : "Unknown error";
      addGuideMessage("guide", message);
    } finally {
      setIsConsultingGuide(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError(null);

      const payload = todoMutationSchema.parse(formState);
      const isEdit = editorState?.mode === "edit";
      const endpoint = isEdit ? `${apiBaseUrl}/api/todos/${editorState.todo.id}` : `${apiBaseUrl}/api/todos`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(isEdit ? "Unable to update this task right now." : "Unable to create this task right now.");
      }

      const parsed = todoResponseSchema.parse(await response.json());

      setTodos((current) => {
        if (isEdit) {
          return current.map((todo) => (todo.id === parsed.todo.id ? parsed.todo : todo));
        }

        return [...current, parsed.todo];
      });

      closeModal();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unknown error";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(todo: TodoItem) {
    const confirmed = window.confirm(`Delete "${todo.title}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/todos/${todo.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Unable to delete this task right now.");
      }

      setTodos((current) => current.filter((item) => item.id !== todo.id));
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Unknown error";
      setError(message);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="eyebrow">Dragonborn quest ledger</div>
        <h1>Hall Of The Last Todo</h1>
        <p className="hero-copy">
          A Nordic fantasy task board with a local guide who treats your to-do list like a hero&apos;s quest log.
        </p>
      </section>

      <section className="adventure-layout">
        <section className="content-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Quest log</p>
              <h2>Trials before dusk</h2>
            </div>
            <div className="section-actions">
              <div className="section-badge">{todos.length} quests</div>
              <button className="primary-button" onClick={openCreateModal} type="button">
                Add task
              </button>
            </div>
          </div>

          {isLoading ? <p className="state-message">Loading the list...</p> : null}
          {error ? <p className="state-message state-message-error">{error}</p> : null}

          {!isLoading && !error ? (
            <div className="todo-grid">
              {todos.map((todo) => (
                <article className="todo-card" key={todo.id} style={{ ["--card-accent" as string]: todo.accentColor }}>
                  <div className="todo-meta">
                    <span className="todo-category">{todo.category}</span>
                    <span className="todo-priority">{todo.priorityLabel}</span>
                  </div>
                  <p className={`todo-status ${todo.completed ? "todo-status-complete" : ""}`}>
                    {todo.completed ? "Quest complete" : "Quest active"}
                  </p>
                  <h3>{todo.title}</h3>
                  <div className="todo-card-actions">
                    <button className="ghost-button" onClick={() => openEditModal(todo)} type="button">
                      Edit
                    </button>
                    <button className="ghost-button ghost-button-danger" onClick={() => handleDelete(todo)} type="button">
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <aside className="guide-panel">
          <div className="guide-header">
            <p className="section-kicker">Dragon guide</p>
            <h2>Fus Ro Plan</h2>
            <p className="guide-copy">
              Choose the rune that matches your current intention. The guide answers from your task list and a small code of discipline.
            </p>
          </div>

          <div className="intention-circle" aria-label="Intention circle">
            <div className="circle-core">
              <span>Thu&apos;um</span>
              <strong>{intentions.find((entry) => entry.id === selectedIntention)?.title}</strong>
            </div>
            {intentions.map((intention, index) => (
              <button
                className={`circle-node ${selectedIntention === intention.id ? "circle-node-active" : ""}`}
                key={intention.id}
                onClick={() => chooseIntention(intention.id)}
                style={{ ["--node-index" as string]: index } as React.CSSProperties}
                type="button"
              >
                <span className="circle-rune">{intention.rune}</span>
                <span className="circle-label">{intention.title}</span>
              </button>
            ))}
          </div>

          <div className="intention-summary">
            {intentions.find((entry) => entry.id === selectedIntention)?.summary}
          </div>

          <div className="chat-panel">
            <div className="chat-log">
              {guideMessages.map((message) => (
                <article className={`chat-message chat-message-${message.speaker}`} key={message.id}>
                  <span className="chat-speaker">{message.speaker === "guide" ? "Guide" : "Dragonborn"}</span>
                  <p>{message.text}</p>
                </article>
              ))}
              {isConsultingGuide ? (
                <article className="chat-message chat-message-guide chat-message-thinking">
                  <span className="chat-speaker">Guide</span>
                  <p>Consulting the Greybeards...</p>
                </article>
              ) : null}
            </div>

            <div className="chat-suggestions">
              {["What should I do next?", "Help me focus", "How is my progress?", "I feel overwhelmed"].map((prompt) => (
                <button className="suggestion-chip" key={prompt} onClick={() => setChatInput(prompt)} type="button">
                  {prompt}
                </button>
              ))}
            </div>

            <form className="chat-form" onSubmit={handleGuideSubmit}>
              <input
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask for counsel, Dragonborn..."
                type="text"
                value={chatInput}
              />
              <button className="primary-button" disabled={isConsultingGuide} type="submit">
                {isConsultingGuide ? "Listening..." : "Seek guidance"}
              </button>
            </form>
          </div>
        </aside>
      </section>

      {editorState ? (
        <div className="modal-shell" role="presentation">
          <div aria-modal="true" className="modal-panel" role="dialog">
            <div className="modal-header">
              <div>
                <p className="section-kicker">{editorState.mode === "create" ? "New task" : "Task details"}</p>
                <h2>{editorState.mode === "create" ? "Create a new task" : "Edit task"}</h2>
              </div>
              <button aria-label="Close task editor" className="icon-button" onClick={closeModal} type="button">
                ×
              </button>
            </div>

            <form className="editor-form" onSubmit={handleSubmit}>
              <label>
                <span>Title</span>
                <input
                  onChange={(event) => updateForm("title", event.target.value)}
                  required
                  type="text"
                  value={formState.title}
                />
              </label>

              <label>
                <span>Category</span>
                <input
                  onChange={(event) => updateForm("category", event.target.value)}
                  required
                  type="text"
                  value={formState.category}
                />
              </label>

              <label>
                <span>Priority label</span>
                <input
                  onChange={(event) => updateForm("priorityLabel", event.target.value)}
                  required
                  type="text"
                  value={formState.priorityLabel}
                />
              </label>

              <label>
                <span>Accent color</span>
                <input onChange={(event) => updateForm("accentColor", event.target.value)} type="color" value={formState.accentColor} />
              </label>

              <label className="checkbox-row">
                <input
                  checked={formState.completed}
                  onChange={(event) => updateForm("completed", event.target.checked)}
                  type="checkbox"
                />
                <span>Mark this task as completed</span>
              </label>

              <div className="modal-actions">
                <button className="ghost-button" onClick={closeModal} type="button">
                  Cancel
                </button>
                <button className="primary-button" disabled={isSaving} type="submit">
                  {isSaving ? "Saving..." : editorState.mode === "create" ? "Create task" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
