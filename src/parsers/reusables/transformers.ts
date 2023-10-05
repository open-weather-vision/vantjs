function convertWindDirectionDegreesToAbbrevation(
    windDirection: number | null
):
    | "NNE"
    | "NE"
    | "ENE"
    | "E"
    | "ESE"
    | "SE"
    | "SSE"
    | "S"
    | "SSW"
    | "SW"
    | "WSW"
    | "W"
    | "WNW"
    | "NW"
    | "NNW"
    | "N"
    | null {
    if (windDirection === null) return null;
    const steps = [
        22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270,
        292.5, 315, 337.5, 360,
    ];
    const stepsAbbrevations: [
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW",
        "N"
    ] = [
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW",
        "N",
    ];
    const differences = [];

    for (const step of steps) {
        let difference = Math.abs(step - windDirection);
        if (difference > 180) {
            difference = 360 - difference;
        }
        differences.push(difference);
    }

    let smallestDifference = 361;
    let smallestDifferenceIndex = -1;
    for (let i = 0; i < differences.length; i++) {
        if (differences[i] < smallestDifference) {
            smallestDifference = differences[i];
            smallestDifferenceIndex = i;
        }
    }

    if (smallestDifferenceIndex === -1) {
        return null;
    } else {
        return stepsAbbrevations[smallestDifferenceIndex];
    }
}

const transformers = {
    alarm: (value: number | null) => (value !== null ? value === 1 : null),
    temperature: (value: number | null) => (value !== null ? value / 10 : null),
    time: (value: number | null) => {
        if (value === null) return null;
        const stringValue = value.toString();
        let hours: number, minutes: number;
        switch (stringValue.length) {
            case 1:
            case 2:
                hours = 0;
                minutes = parseInt(stringValue);
                break;
            case 3:
                hours = parseInt(stringValue.charAt(0));
                minutes = parseInt(stringValue.substring(1));
                break;
            case 4:
                hours = parseInt(stringValue.substring(0, 2));
                minutes = parseInt(stringValue.substring(2));
                break;
            default:
                return null;
        }
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date;
    },
    hex: (value: number | null) =>
        value !== null ? `0x${value.toString(16)}` : null,
    uv: (value: number | null) => (value !== null ? value / 10 : null),
    tempExtra: (value: number | null) => (value !== null ? value - 90 : null),
    soilTemp: (value: number | null) => (value !== null ? value - 90 : null),
    leafTemp: (value: number | null) => (value !== null ? value - 90 : null),
    etDay: (value: number | null) => (value !== null ? value / 1000 : null),
    monthET: (value: number | null) => (value !== null ? value / 100 : null),
    yearET: (value: number | null) => (value !== null ? value / 100 : null),
    pressure: (value: number | null) => {
        if (value === null || value < 20_000 || value > 32_500) return null;
        else return value / 1000;
    },
    stormStartDate: (value: number | null) => {
        if (value === null) return null;
        const day = (0x0f80 & value) >> 7;
        const month = (0xf000 & value) >> 12;
        const year = (0x007f & value) + 2000;
        return new Date(`${year}-${month}-${day}`);
    },
    windDir: (value: number | null) => {
        if (value === null) {
            return null;
        }
        return convertWindDirectionDegreesToAbbrevation(value);
    },
    forecastID: (val: number) => {
        switch (val) {
            case 8:
            case 6:
            case 2:
            case 3:
            case 18:
            case 19:
            case 7:
            case 22:
            case 23:
                return val;
            default:
                return null;
        }
    },
    forecast: (val: number | null) => {
        switch (val) {
            case 8:
                return "Mostly Clear";
            case 6:
                return "Partly Cloudy";
            case 2:
                return "Mostly Cloudy";
            case 3:
                return "Mostly Cloudy, Rain within 12 hours";
            case 18:
                return "Mostly Cloudy, Snow within 12 hours";
            case 19:
                return "Mostly Cloudy, Rain or Snow within 12 hours";
            case 7:
                return "Partly Cloudy, Rain within 12 hours";
            case 22:
                return "Partly Cloudy, Snow within 12 hours";
            case 23:
                return "Partly Cloudy, Rain or Snow within 12 hours";
            default:
                return null;
        }
    },
    pressTrend: (value: number | null) => {
        switch (value) {
            case -60:
                return "Falling Rapidly";
            case -20:
                return "Falling Slowly";
            case 0:
                return "Steady";
            case 20:
                return "Rising Slowly";
            case 60:
                return "Rising Rapidly";
            default:
                return null;
        }
    },
    pressTrendID: (value: number) => {
        switch (value) {
            case -60:
            case -20:
            case 0:
            case 20:
            case 60:
                return value;
            default:
                return null;
        }
    },
    pressReductionMethodID: (val: number) => {
        switch (val) {
            case 0:
            case 1:
            case 2:
                return val;
            default:
                return null;
        }
    },
    pressReductionMethod: (val: number | null) => {
        switch (val) {
            case 0:
                return "user offset";
            case 1:
                return "altimeter setting";
            case 2:
                return "NOAA bar reduction";
            default:
                return null;
        }
    },
};

export default transformers;
