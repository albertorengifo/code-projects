import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { guideChatResponseSchema, todoMutationSchema, todoResponseSchema, todosResponseSchema } from "@todo-list/shared";
const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const intentions = [
    { id: "discipline", title: "Discipline", rune: "I", summary: "Cut through unfinished work and build momentum." },
    { id: "glory", title: "Glory", rune: "II", summary: "Choose the task that will feel most triumphant to finish." },
    { id: "wisdom", title: "Wisdom", rune: "III", summary: "Bring order to the quest log before charging ahead." },
    { id: "endurance", title: "Endurance", rune: "IV", summary: "Favor steady progress over dramatic bursts." }
];
const emptyFormState = {
    title: "",
    category: "",
    accentColor: "#FF7A59",
    priorityLabel: "Today",
    completed: false
};
function buildGuidanceForIntention(intention, todos) {
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
    const [todos, setTodos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editorState, setEditorState] = useState(null);
    const [formState, setFormState] = useState(emptyFormState);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedIntention, setSelectedIntention] = useState("discipline");
    const [chatInput, setChatInput] = useState("");
    const [isConsultingGuide, setIsConsultingGuide] = useState(false);
    const [guideMessages, setGuideMessages] = useState([
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
        }
        catch (loadError) {
            const message = loadError instanceof Error ? loadError.message : "Unknown error";
            setError(message);
        }
        finally {
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
    function openEditModal(todo) {
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
    function updateForm(field, value) {
        setFormState((current) => ({ ...current, [field]: value }));
    }
    function addGuideMessage(speaker, text) {
        setGuideMessages((current) => [...current, { id: current.length + 1, speaker, text }]);
    }
    function chooseIntention(intention) {
        setSelectedIntention(intention);
        addGuideMessage("guide", buildGuidanceForIntention(intention, todos));
    }
    async function handleGuideSubmit(event) {
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
        }
        catch (guideError) {
            const message = guideError instanceof Error ? guideError.message : "Unknown error";
            addGuideMessage("guide", message);
        }
        finally {
            setIsConsultingGuide(false);
        }
    }
    async function handleSubmit(event) {
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
        }
        catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : "Unknown error";
            setError(message);
        }
        finally {
            setIsSaving(false);
        }
    }
    async function handleDelete(todo) {
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
        }
        catch (deleteError) {
            const message = deleteError instanceof Error ? deleteError.message : "Unknown error";
            setError(message);
        }
    }
    return (_jsxs("main", { className: "page-shell", children: [_jsxs("section", { className: "hero-panel", children: [_jsx("div", { className: "eyebrow", children: "Dragonborn quest ledger" }), _jsx("h1", { children: "Hall Of The Last Todo" }), _jsx("p", { className: "hero-copy", children: "A Nordic fantasy task board with a local guide who treats your to-do list like a hero's quest log." })] }), _jsxs("section", { className: "adventure-layout", children: [_jsxs("section", { className: "content-panel", children: [_jsxs("div", { className: "section-heading", children: [_jsxs("div", { children: [_jsx("p", { className: "section-kicker", children: "Quest log" }), _jsx("h2", { children: "Trials before dusk" })] }), _jsxs("div", { className: "section-actions", children: [_jsxs("div", { className: "section-badge", children: [todos.length, " quests"] }), _jsx("button", { className: "primary-button", onClick: openCreateModal, type: "button", children: "Add task" })] })] }), isLoading ? _jsx("p", { className: "state-message", children: "Loading the list..." }) : null, error ? _jsx("p", { className: "state-message state-message-error", children: error }) : null, !isLoading && !error ? (_jsx("div", { className: "todo-grid", children: todos.map((todo) => (_jsxs("article", { className: "todo-card", style: { ["--card-accent"]: todo.accentColor }, children: [_jsxs("div", { className: "todo-meta", children: [_jsx("span", { className: "todo-category", children: todo.category }), _jsx("span", { className: "todo-priority", children: todo.priorityLabel })] }), _jsx("p", { className: `todo-status ${todo.completed ? "todo-status-complete" : ""}`, children: todo.completed ? "Quest complete" : "Quest active" }), _jsx("h3", { children: todo.title }), _jsxs("div", { className: "todo-card-actions", children: [_jsx("button", { className: "ghost-button", onClick: () => openEditModal(todo), type: "button", children: "Edit" }), _jsx("button", { className: "ghost-button ghost-button-danger", onClick: () => handleDelete(todo), type: "button", children: "Delete" })] })] }, todo.id))) })) : null] }), _jsxs("aside", { className: "guide-panel", children: [_jsxs("div", { className: "guide-header", children: [_jsx("p", { className: "section-kicker", children: "Dragon guide" }), _jsx("h2", { children: "Fus Ro Plan" }), _jsx("p", { className: "guide-copy", children: "Choose the rune that matches your current intention. The guide answers from your task list and a small code of discipline." })] }), _jsxs("div", { className: "intention-circle", "aria-label": "Intention circle", children: [_jsxs("div", { className: "circle-core", children: [_jsx("span", { children: "Thu'um" }), _jsx("strong", { children: intentions.find((entry) => entry.id === selectedIntention)?.title })] }), intentions.map((intention, index) => (_jsxs("button", { className: `circle-node ${selectedIntention === intention.id ? "circle-node-active" : ""}`, onClick: () => chooseIntention(intention.id), style: { ["--node-index"]: index }, type: "button", children: [_jsx("span", { className: "circle-rune", children: intention.rune }), _jsx("span", { className: "circle-label", children: intention.title })] }, intention.id)))] }), _jsx("div", { className: "intention-summary", children: intentions.find((entry) => entry.id === selectedIntention)?.summary }), _jsxs("div", { className: "chat-panel", children: [_jsxs("div", { className: "chat-log", children: [guideMessages.map((message) => (_jsxs("article", { className: `chat-message chat-message-${message.speaker}`, children: [_jsx("span", { className: "chat-speaker", children: message.speaker === "guide" ? "Guide" : "Dragonborn" }), _jsx("p", { children: message.text })] }, message.id))), isConsultingGuide ? (_jsxs("article", { className: "chat-message chat-message-guide chat-message-thinking", children: [_jsx("span", { className: "chat-speaker", children: "Guide" }), _jsx("p", { children: "Consulting the Greybeards..." })] })) : null] }), _jsx("div", { className: "chat-suggestions", children: ["What should I do next?", "Help me focus", "How is my progress?", "I feel overwhelmed"].map((prompt) => (_jsx("button", { className: "suggestion-chip", onClick: () => setChatInput(prompt), type: "button", children: prompt }, prompt))) }), _jsxs("form", { className: "chat-form", onSubmit: handleGuideSubmit, children: [_jsx("input", { onChange: (event) => setChatInput(event.target.value), placeholder: "Ask for counsel, Dragonborn...", type: "text", value: chatInput }), _jsx("button", { className: "primary-button", disabled: isConsultingGuide, type: "submit", children: isConsultingGuide ? "Listening..." : "Seek guidance" })] })] })] })] }), editorState ? (_jsx("div", { className: "modal-shell", role: "presentation", children: _jsxs("div", { "aria-modal": "true", className: "modal-panel", role: "dialog", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { children: [_jsx("p", { className: "section-kicker", children: editorState.mode === "create" ? "New task" : "Task details" }), _jsx("h2", { children: editorState.mode === "create" ? "Create a new task" : "Edit task" })] }), _jsx("button", { "aria-label": "Close task editor", className: "icon-button", onClick: closeModal, type: "button", children: "\u00D7" })] }), _jsxs("form", { className: "editor-form", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "Title" }), _jsx("input", { onChange: (event) => updateForm("title", event.target.value), required: true, type: "text", value: formState.title })] }), _jsxs("label", { children: [_jsx("span", { children: "Category" }), _jsx("input", { onChange: (event) => updateForm("category", event.target.value), required: true, type: "text", value: formState.category })] }), _jsxs("label", { children: [_jsx("span", { children: "Priority label" }), _jsx("input", { onChange: (event) => updateForm("priorityLabel", event.target.value), required: true, type: "text", value: formState.priorityLabel })] }), _jsxs("label", { children: [_jsx("span", { children: "Accent color" }), _jsx("input", { onChange: (event) => updateForm("accentColor", event.target.value), type: "color", value: formState.accentColor })] }), _jsxs("label", { className: "checkbox-row", children: [_jsx("input", { checked: formState.completed, onChange: (event) => updateForm("completed", event.target.checked), type: "checkbox" }), _jsx("span", { children: "Mark this task as completed" })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { className: "ghost-button", onClick: closeModal, type: "button", children: "Cancel" }), _jsx("button", { className: "primary-button", disabled: isSaving, type: "submit", children: isSaving ? "Saving..." : editorState.mode === "create" ? "Create task" : "Save changes" })] })] })] }) })) : null] }));
}
