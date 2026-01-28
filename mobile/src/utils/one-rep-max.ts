export function calculateOneRepMax(weight: number, reps: number): number {
    return Math.floor(weight * (36 / (37 - reps)));
}
