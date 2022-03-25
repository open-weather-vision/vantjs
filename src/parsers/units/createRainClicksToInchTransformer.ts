import { RainCollectorSize } from "../../interfaces/settings/RainCollectorSize";

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
                    rain = rain / 254;
                    break;
                case "0.2mm":
                    rain = rain / 127;
                    break;
            }
        }
        return rain;
    };
}
