export function secondsToHHMMSS(totalSeconds: number): string {
    if (totalSeconds < 0) {
        throw new Error("Input cannot be negative");
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return [hours, minutes, seconds]
        .map((v) => v.toString().padStart(2, "0"))
        .join(":");
}

export function HHMMSStoSeconds(duration: string): number {
    const parts = duration.split(":");
    if (parts.length !== 3) {
        throw new Error(
            `Invalid duration format, expected HH:MM:SS, got ${duration}`
        );
    }

    const [hours, minutes, seconds] = parts.map(Number);

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        throw new Error(
            `Invalid duration format, contains non-numeric parts: ${duration}`
        );
    }

    return hours * 3600 + minutes * 60 + seconds;
}
