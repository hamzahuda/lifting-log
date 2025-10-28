import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import defaultExercises from "@/../assets/data/defaultExercises.json";

const DB_VERSION_KEY = "@default_exercises_version";
const LATEST_DEFAULT_EXERCISES_VERSION = 1;

export async function initialiseDatabase() {
    const db = await SQLite.openDatabaseAsync("liftinglog.db");

    try {
        const storedVersionStr = await AsyncStorage.getItem(DB_VERSION_KEY);
        const storedVersion = storedVersionStr
            ? parseInt(storedVersionStr, 10)
            : 0;

        if (storedVersion < LATEST_DEFAULT_EXERCISES_VERSION) {
            console.log(
                `Upgrading database from version ${storedVersion} to ${LATEST_DEFAULT_EXERCISES_VERSION}`
            );

            db.withExclusiveTransactionAsync(async () => {
                // Create table if it doesn't exist
                await db.runAsync(
                    `CREATE TABLE IF NOT EXISTS exercise_names (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT UNIQUE,
                        is_custom INTEGER DEFAULT 0
                    );`
                );

                // Add default exercises, ignore the ones that already exist
                for (const exerciseName of defaultExercises) {
                    await db.runAsync(
                        "INSERT OR IGNORE INTO exercise_names (name, is_custom) VALUES (?, 0);",
                        [exerciseName]
                    );
                }
            });

            await AsyncStorage.setItem(
                DB_VERSION_KEY,
                LATEST_DEFAULT_EXERCISES_VERSION.toString()
            );
            console.log("Database updated");
        } else {
            console.log(`Database up to date at version ${storedVersion}`);
        }
    } catch (error) {
        console.error("Error initialising database:", error);
    }
}
