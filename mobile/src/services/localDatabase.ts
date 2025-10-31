import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import defaultExercises from "@/../assets/data/defaultExercises.json";
import api from "./api";

const DB_VERSION_KEY = "@default_exercises_version";
const LATEST_DEFAULT_EXERCISES_VERSION = 1;

// ====================================================================
//  INITIALISATION
// ====================================================================

export async function initialiseDatabase(db: SQLite.SQLiteDatabase) {
    try {
        const storedVersionStr = await AsyncStorage.getItem(DB_VERSION_KEY);
        const storedVersion = storedVersionStr
            ? parseInt(storedVersionStr, 10)
            : 0;

        if (storedVersion === 0) {
            console.log("Creating initial exercise names database");

            await db.withExclusiveTransactionAsync(async () => {
                await db.runAsync("DROP TABLE IF EXISTS exercise_names;");
                await db.runAsync(
                    `CREATE VIRTUAL TABLE IF NOT EXISTS exercise_names USING fts5(
                        name,
                        is_custom UNINDEXED,
                        backend_id UNINDEXED,
                        needs_sync UNINDEXED,
                        is_deleted UNINDEXED
                    );`
                );

                const insertedNames = new Set<string>();
                for (const exerciseName of defaultExercises) {
                    if (!insertedNames.has(exerciseName)) {
                        await _addDefaultExercise(db, exerciseName);
                        insertedNames.add(exerciseName);
                    }
                }
            });
        } else if (storedVersion < LATEST_DEFAULT_EXERCISES_VERSION) {
            console.log(
                `Upgrading database from version ${storedVersion} to ${LATEST_DEFAULT_EXERCISES_VERSION}`
            );

            await db.withExclusiveTransactionAsync(async () => {
                const existingNames = new Set(await getAllExercises(db));

                let newExercisesAdded = 0;
                for (const exerciseName of defaultExercises) {
                    if (!existingNames.has(exerciseName)) {
                        await _addDefaultExercise(db, exerciseName);
                        newExercisesAdded++;
                    }
                }

                console.log(
                    `Migration: Added ${newExercisesAdded} new default exercises.`
                );
            });
        } else {
            console.log(`Database up to date at version ${storedVersion}`);
        }

        await AsyncStorage.setItem(
            DB_VERSION_KEY,
            LATEST_DEFAULT_EXERCISES_VERSION.toString()
        );

        await pullCustomExercisesFromBackend(db);
        await pushCustomExercisesToBackend(db);
    } catch (error) {
        console.error("Error initialising database:", error);
    }
}

async function _addDefaultExercise(db: SQLite.SQLiteDatabase, name: string) {
    try {
        await db.runAsync(
            "INSERT INTO exercise_names (name, is_custom, backend_id, needs_sync, is_deleted) VALUES (?, 0, NULL, 0, 0);",
            [name]
        );
    } catch (error) {
        console.log("Error adding default exercise:", error);
    }
}

// ====================================================================
//  PUBLIC API - CRUD & SEARCH
// ====================================================================

export async function searchExercises(
    db: SQLite.SQLiteDatabase,
    query: string
): Promise<string[]> {
    try {
        const ftsQuery = query
            .trim()
            .replace(/[*-+()"]/g, " ")
            .split(" ")
            .filter((term) => term.length > 0)
            .map((term) => `${term}*`)
            .join(" ");

        if (!ftsQuery) {
            return [];
        }

        return (
            await db.getAllAsync<{ name: string }>(
                "SELECT name FROM exercise_names WHERE name MATCH ? AND is_deleted = 0 ORDER BY rank",
                [ftsQuery]
            )
        ).map((row) => row.name);
    } catch (error) {
        console.error("FTS query failed: ", error);
        return [];
    }
}

export async function addCustomExercise(
    db: SQLite.SQLiteDatabase,
    name: string,
    options: {
        needs_sync?: number;
        backend_id?: string | null;
    } = {}
) {
    const { needs_sync = 1, backend_id = null } = options;

    try {
        const existing = await db.getFirstAsync<{ backend_id: string | null }>(
            "SELECT backend_id FROM exercise_names WHERE name = ? AND is_deleted = 0 LIMIT 1",
            [name]
        );

        if (!existing) {
            await db.runAsync(
                "INSERT INTO exercise_names (name, is_custom, backend_id, needs_sync, is_deleted) VALUES (?, 1, ?, ?, 0);",
                [name, backend_id, needs_sync]
            );
        } else if (existing.backend_id === null && backend_id !== null) {
            // A local, unsynced exercise with this name already exists, so link the local one.
            await db.runAsync(
                "UPDATE exercise_names SET backend_id = ?, needs_sync = 0 WHERE name = ? AND is_custom = 1 AND backend_id IS NULL",
                [backend_id, name]
            );
        }
    } catch (error) {
        console.error("Error creating new exercise:", error);
        throw error;
    }
}

export async function deleteCustomExercise(
    db: SQLite.SQLiteDatabase,
    name: string
) {
    try {
        await db.runAsync(
            "UPDATE exercise_names SET is_deleted = 1, needs_sync = 1 WHERE name = ? AND is_custom = 1 AND is_deleted = 0",
            [name]
        );
    } catch (error) {
        console.error("Error deleting exercise:", error);
        throw error;
    }
}

export async function getAllExercises(
    db: SQLite.SQLiteDatabase
): Promise<string[]> {
    try {
        const results = await db.getAllAsync<{ name: string }>(
            "SELECT name FROM exercise_names WHERE is_deleted = 0 ORDER BY name"
        );
        return results.map((row) => row.name);
    } catch (error) {
        console.error("Error getting all exercises:", error);
        return [];
    }
}

export async function getAllCustomExercises(
    db: SQLite.SQLiteDatabase
): Promise<string[]> {
    try {
        const results = await db.getAllAsync<{ name: string }>(
            "SELECT name FROM exercise_names WHERE is_custom = 1 AND is_deleted = 0 ORDER BY name"
        );
        return results.map((row) => row.name);
    } catch (error) {
        console.error("Error getting custom exercises:", error);
        return [];
    }
}

export async function updateCustomExercise(
    db: SQLite.SQLiteDatabase,
    oldName: string,
    newName: string
) {
    try {
        await db.withExclusiveTransactionAsync(async () => {
            const existing = await db.getFirstAsync(
                "SELECT 1 FROM exercise_names WHERE name = ? AND is_deleted = 0 LIMIT 1",
                [newName]
            );

            if (existing) {
                throw new Error(
                    `An exercise named "${newName}" already exists.`
                );
            }

            const result = await db.runAsync(
                "UPDATE exercise_names SET name = ?, needs_sync = 1 WHERE name = ? AND is_deleted = 0 AND is_custom = 1",
                [newName, oldName]
            );

            if (result.changes === 0) {
                throw new Error(
                    `Could not find a custom exercise named "${oldName}" to update.`
                );
            }
        });
    } catch (error) {
        console.error("Error updating custom exercise:", error);
        throw error;
    }
}

// ====================================================================
//  PRIVATE - SYNC LOGIC
// ====================================================================

interface RemoteCustomExercise {
    id: string;
    name: string;
}

async function pullCustomExercisesFromBackend(db: SQLite.SQLiteDatabase) {
    try {
        const remoteExercises: RemoteCustomExercise[] = await api
            .get("/custom-exercise-names/")
            .then((response) => response.data);

        const localExercises = new Map(
            (
                await db.getAllAsync<{
                    backend_id: string;
                    name: string;
                }>(
                    "SELECT backend_id, name FROM exercise_names WHERE is_custom = 1 AND backend_id IS NOT NULL"
                )
            ).map((customEx) => [customEx.backend_id, customEx.name])
        );

        await db.withExclusiveTransactionAsync(async () => {
            for (const remoteExercise of remoteExercises) {
                const localName = localExercises.get(remoteExercise.id);

                if (localName === undefined) {
                    // This exercise is on the backend but not locally so add it
                    await addCustomExercise(db, remoteExercise.name, {
                        needs_sync: 0,
                        backend_id: remoteExercise.id,
                    });
                } else if (localName !== remoteExercise.name) {
                    // Backend has an updated name for this exercise (only if it has no pending sync)
                    await db.runAsync(
                        "UPDATE exercise_names SET name = ? WHERE backend_id = ? AND needs_sync = 0",
                        [remoteExercise.name, remoteExercise.id]
                    );
                }
            }
        });
    } catch (error) {
        console.error("Error loading custom exercises from backend:", error);
    }
}

async function pushCustomExercisesToBackend(db: SQLite.SQLiteDatabase) {
    let customExercisesToSync;
    try {
        customExercisesToSync = await db.getAllAsync<{
            name: string;
            is_deleted: number;
            backend_id: string | null;
        }>(
            "SELECT name, backend_id, is_deleted FROM exercise_names WHERE is_custom = 1 AND needs_sync = 1"
        );
    } catch (error) {
        console.error("Error fetching exercises to sync:", error);
        return;
    }

    if (customExercisesToSync.length === 0) {
        console.log("Sync: No local changes to push.");
        return;
    }

    for (const customExercise of customExercisesToSync) {
        try {
            if (customExercise.is_deleted === 0) {
                if (!customExercise.backend_id) {
                    const response = await api.post<RemoteCustomExercise>(
                        "/custom-exercise-names/",
                        {
                            name: customExercise.name,
                        }
                    );

                    await db.runAsync(
                        "UPDATE exercise_names SET needs_sync = 0, backend_id = ? WHERE name = ?",
                        [response.data.id, customExercise.name]
                    );
                } else {
                    await api.put(
                        `/custom-exercise-names/${customExercise.backend_id}/`,
                        { name: customExercise.name }
                    );

                    await db.runAsync(
                        "UPDATE exercise_names SET needs_sync = 0 WHERE backend_id = ?",
                        [customExercise.backend_id]
                    );
                }
            } else if (customExercise.is_deleted === 1) {
                if (customExercise.backend_id) {
                    await api.delete(
                        `/custom-exercise-names/${customExercise.backend_id}/`
                    );
                }

                await db.runAsync("DELETE FROM exercise_names WHERE name = ?", [
                    customExercise.name,
                ]);
            }
        } catch (error) {
            console.error(
                `Error syncing exercise '${customExercise.name}':`,
                error
            );
        }
    }
}
