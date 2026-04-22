import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";

const dataDirectory = path.resolve(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "todos.db");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

export const db = new sqlite3.Database(databasePath);

export function initializeDatabase(): Promise<void> {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      accent_color TEXT NOT NULL,
      priority_label TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0
    );
  `;

  const addCompletedColumnSql = `
    ALTER TABLE todos ADD COLUMN completed INTEGER NOT NULL DEFAULT 0;
  `;

  const seedSql = `
    INSERT OR IGNORE INTO todos (id, title, category, accent_color, priority_label, completed)
    VALUES
      (1, 'Book the ocean-view staycation', 'Weekend', '#FF7A59', 'Today', 0),
      (2, 'Refine the capsule wardrobe board', 'Style', '#0F8BFF', 'Soon', 0),
      (3, 'Curate a rooftop dinner playlist', 'Creative', '#18B984', 'This week', 1),
      (4, 'Test the sunrise run route', 'Wellness', '#8F5BFF', 'This month', 0);
  `;

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(schemaSql, (schemaError) => {
        if (schemaError) {
          reject(schemaError);
          return;
        }

        db.run(addCompletedColumnSql, (alterError) => {
          const isDuplicateColumnError =
            alterError instanceof Error && alterError.message.includes("duplicate column name");

          if (alterError && !isDuplicateColumnError) {
            reject(alterError);
            return;
          }

          db.run(seedSql, (seedError) => {
            if (seedError) {
              reject(seedError);
              return;
            }

            resolve();
          });
        });
      });
    });
  });
}
