import { logarithmic, linear, Result } from "regression";

export type RegressionType = "linear" | "logarithmic";

export interface RegressionData {
    models: {
        linear: Result;
        logarithmic: Result;
    };
    earliestTimestamp: number;
    recommended: RegressionType;
}

export function getRegressionResult(
    dailyMaxes: Map<string, number>,
): RegressionData | null {
    if (dailyMaxes.size < 2) return null;

    const validData = Array.from(dailyMaxes.entries())
        .map(([dateStr, weight]) => ({
            timestamp: new Date(dateStr).getTime(),
            weight: weight,
        }))
        .filter((entry) => !isNaN(entry.timestamp));

    if (validData.length < 2) return null;

    validData.sort((a, b) => a.timestamp - b.timestamp);
    const earliestTimestamp = validData[0].timestamp;

    const dataPoints: [number, number][] = validData.map((entry) => {
        const daysSinceStart =
            (entry.timestamp - earliestTimestamp) / (1000 * 60 * 60 * 24) + 1;
        return [daysSinceStart, entry.weight];
    });

    const logModel = logarithmic(dataPoints);
    const linModel = linear(dataPoints);

    const recommended: RegressionType =
        linModel.r2 > logModel.r2 ? "linear" : "logarithmic";

    return {
        models: {
            linear: linModel,
            logarithmic: logModel,
        },
        earliestTimestamp,
        recommended,
    };
}

export function calculateGoalPrediction(
    dailyMaxes: Map<string, number>,
    goalWeight: number | undefined,
    selectedType?: RegressionType,
): string | null {
    if (!goalWeight || goalWeight <= 0) return null;

    const currentMax = Math.max(...Array.from(dailyMaxes.values()));
    if (currentMax >= goalWeight) return "Goal Achieved!";

    // Grab the regression data
    const regData = getRegressionResult(dailyMaxes);
    if (!regData) return null;

    const typeToUse = selectedType || regData.recommended;
    const model = regData.models[typeToUse];
    const { earliestTimestamp } = regData;

    const now = new Date().getTime();
    const daysFromStartToNow =
        Math.floor((now - earliestTimestamp) / (1000 * 60 * 60 * 24)) + 1;

    const todayPrediction = model.predict(daysFromStartToNow)[1];
    const tomorrowPrediction = model.predict(daysFromStartToNow + 1)[1];
    if (tomorrowPrediction <= todayPrediction) {
        return "Progress plateaued - keep pushing to predict!";
    }

    const maxSearchDays = daysFromStartToNow + 365;
    let daysFromStartToGoal: number;

    // solve for x (days) using the target y (goalWeight)
    if (typeToUse === "linear") {
        const [m, b] = model.equation; // y = mx + b
        daysFromStartToGoal = (goalWeight - b) / m;
    } else {
        // logarithmic
        const [a, b] = model.equation; //  y = a + b * ln(x)
        daysFromStartToGoal = Math.exp((goalWeight - a) / b);
    }

    daysFromStartToGoal = Math.ceil(daysFromStartToGoal);

    // If the prediction is NaN, infinitely far away, or beyond our 1-year cap
    if (
        isNaN(daysFromStartToGoal) ||
        !isFinite(daysFromStartToGoal) ||
        daysFromStartToGoal > maxSearchDays
    ) {
        return "Estimated time: > 1 year";
    }

    const daysFromNowToGoal = daysFromStartToGoal - daysFromStartToNow;

    if (daysFromNowToGoal <= 0) {
        return "Goal should be achieved soon!";
    } else {
        const months = Math.floor(daysFromNowToGoal / 30);
        const days = Math.floor(daysFromNowToGoal % 30);

        let timeString = "";

        if (months > 0) {
            timeString += `${months} month${months > 1 ? "s" : ""}`;
        }

        if (days > 0) {
            if (months > 0) timeString += ", ";
            timeString += `${days} day${days > 1 ? "s" : ""}`;
        }

        if (timeString === "") {
            return "Estimated time: < 1 day";
        }

        return `Estimated time remaining: ${timeString}`;
    }
}
