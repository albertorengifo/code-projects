import { db } from "./db.js";
import type { TodoItem, TodoMutation } from "@todo-list/shared";

type TodoRow = {
  id: number;
  title: string;
  category: string;
  accent_color: string;
  priority_label: string;
  completed: number;
};

function mapRowToTodoItem(row: TodoRow): TodoItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    accentColor: row.accent_color,
    priorityLabel: row.priority_label,
    completed: Boolean(row.completed)
  };
}

function getTodoById(id: number): Promise<TodoItem | null> {
  return new Promise((resolve, reject) => {
    db.get<TodoRow>(
      `
        SELECT id, title, category, accent_color, priority_label, completed
        FROM todos
        WHERE id = ?
      `,
      [id],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(row ? mapRowToTodoItem(row) : null);
      }
    );
  });
}

export function listTodos(): Promise<TodoItem[]> {
  return new Promise((resolve, reject) => {
    db.all<TodoRow>(
      `
        SELECT id, title, category, accent_color, priority_label, completed
        FROM todos
        ORDER BY id ASC
      `,
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }

        resolve((rows ?? []).map(mapRowToTodoItem));
      }
    );
  });
}

export function createTodo(input: TodoMutation): Promise<TodoItem> {
  return new Promise((resolve, reject) => {
    db.run(
      `
        INSERT INTO todos (title, category, accent_color, priority_label, completed)
        VALUES (?, ?, ?, ?, ?)
      `,
      [input.title, input.category, input.accentColor, input.priorityLabel, input.completed ? 1 : 0],
      function insertCallback(error) {
        if (error) {
          reject(error);
          return;
        }

        void getTodoById(this.lastID)
          .then((todo) => {
            if (!todo) {
              reject(new Error("Created todo could not be loaded"));
              return;
            }

            resolve(todo);
          })
          .catch(reject);
      }
    );
  });
}

export function updateTodo(id: number, input: TodoMutation): Promise<TodoItem | null> {
  return new Promise((resolve, reject) => {
    db.run(
      `
        UPDATE todos
        SET title = ?, category = ?, accent_color = ?, priority_label = ?, completed = ?
        WHERE id = ?
      `,
      [input.title, input.category, input.accentColor, input.priorityLabel, input.completed ? 1 : 0, id],
      function updateCallback(error) {
        if (error) {
          reject(error);
          return;
        }

        if (this.changes === 0) {
          resolve(null);
          return;
        }

        void getTodoById(id)
          .then(resolve)
          .catch(reject);
      }
    );
  });
}

export function deleteTodo(id: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.run(
      `
        DELETE FROM todos
        WHERE id = ?
      `,
      [id],
      function deleteCallback(error) {
        if (error) {
          reject(error);
          return;
        }

        resolve(this.changes > 0);
      }
    );
  });
}
