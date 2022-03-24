import units from "typesafe-units";

/**
 * Converts the passed number of rain clicks to inch using the interface's configured rain collector size.
 * @param rainClicks number of rain clicks
 * @returns rain in inch
 * @hidden
 */
export function createRainClicksToInchTransformer(
    rainCollectorSize: RainCollectorSize
) {
    return (rainClicks: number) => {
        let rain = rainClicks;
        if (rain !== null) {
            switch (rainCollectorSize) {
                case "0.01in":
                    rain = rain * 100;
                    break;
                case "0.1mm":
                    rain = units.from(rain * 10, "mm").to("in");
                    break;
                case "0.2mm":
                    rain = units.from(rain * 5, "mm").to("in");
                    break;
            }
        }
        return rain;
    };
}

export type RainCollectorSize = "0.01in" | "0.2mm" | "0.1mm";
