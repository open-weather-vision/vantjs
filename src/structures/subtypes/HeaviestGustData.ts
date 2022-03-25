import WindDirection from "./WindDirection";

/**
 * Direction and speed of the heaviest gust in the recent 10 minutes
 */
export default class HeaviestGustData {
    /**
     * Direction of the heaviest gust in the recent 10 minutes. `direction.degrees` encodes it
     * in degrees, `direction.abbrevation` as string (`"N"`, `"S"`, ....).
     */
    public direction = new WindDirection();

    /**
     * The heaviest gust's (10min) speed
     */
    public speed: number | null = null;
}
