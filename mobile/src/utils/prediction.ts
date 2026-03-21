import { logarithmic, linear, Result } from "regression";
import { RegressionType } from "@/types";

type RegressionData = {
    models: {
        linear: Result;
        logarithmic: Result;
    };
    earliestTimestamp: number;
    recommended: RegressionType;
};

type PredictionResult =
    | { status: "ACHIEVED" }
    | { status: "PLATEAUED" }
    | { status: "OUT_OF_BOUNDS" }
    | { status: "PREDICTED"; daysRemaining: number };

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

export function calculateDaysToGoal(
    regData: RegressionData,
    dailyMaxes: Map<string, number>,
    goalWeight: number | undefined,
    selectedType: RegressionType,
): PredictionResult | null {
    if (!goalWeight || goalWeight <= 0) return null;

    const currentMax = Math.max(...Array.from(dailyMaxes.values()));
    if (currentMax >= goalWeight) return { status: "ACHIEVED" };

    const model = regData.models[selectedType];
    const { earliestTimestamp } = regData;

    const now = new Date().getTime();
    const daysFromStartToNow =
        Math.floor((now - earliestTimestamp) / (1000 * 60 * 60 * 24)) + 1;

    const todayPrediction = model.predict(daysFromStartToNow)[1];
    const tomorrowPrediction = model.predict(daysFromStartToNow + 1)[1];
    if (tomorrowPrediction <= todayPrediction) {
        return { status: "PLATEAUED" };
    }

    const predictionDaysCap = selectedType === "linear" ? 30 : 360;
    const daysFromStartToMaxSearch = daysFromStartToNow + predictionDaysCap;

    let daysFromStartToGoal: number;

    // solve for x (days) using the target y (goalWeight)
    if (selectedType === "linear") {
        const [m, b] = model.equation; // y = mx + b
        daysFromStartToGoal = (goalWeight - b) / m;
    } else {
        const [a, b] = model.equation; //  y = a + b * ln(x)
        daysFromStartToGoal = Math.exp((goalWeight - a) / b);
    }

    daysFromStartToGoal = Math.ceil(daysFromStartToGoal);

    // If the prediction is NaN, infinite, or exceeds the specific cap for that model
    if (
        isNaN(daysFromStartToGoal) ||
        !isFinite(daysFromStartToGoal) ||
        daysFromStartToGoal > daysFromStartToMaxSearch
    ) {
        return { status: "OUT_OF_BOUNDS" };
    }

    const daysFromNowToGoal = daysFromStartToGoal - daysFromStartToNow;

    if (daysFromNowToGoal <= 0) {
        return { status: "ACHIEVED" };
    }

    return { status: "PREDICTED", daysRemaining: daysFromNowToGoal };
}
