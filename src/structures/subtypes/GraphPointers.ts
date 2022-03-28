/**
 * Pointers pointing to the graph points in the vantage's EEPROM
 */
export default class GraphPointers {
    /**
     * Points to the next 10-minute wind speed graph point. For current
     * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
     * console and 0 to 24 on Vantage Vue console)
     */
    next10mWindSpeed = 0;
    /**
     * Points to the next 15-minute wind speed graph point. For current
     * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
     * console and 0 to 24 on Vantage Vue console)
     */
    next15mWindSpeed = 0;
    /**
     * Points to the next hour wind speed graph point. For current
     * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
     * console and 0 to 24 on Vantage Vue console)
     */
    nextHourWindSpeed = 0;
    /**
     * Points to the next daily wind speed graph point. For current
     * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
     * console and 0 to 24 on Vantage Vue console)
     */
    nextDailyWindSpeed = 0;
    /**
     * Points to the next minute rain graph point. For current
     * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
     * console and 0 to 24 on Vantage Vue console)
     */
    nextMinuteRain = 0;
    /**
     * Points to the next monthly rain graph point. For current
     * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
     * console and 0 to 24 on Vantage Vue console)
     */
    nextMonthlyRain = 0;
    /**
     * Points to the next yearly rain graph point. For current
     * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
     * console and 0 to 24 on Vantage Vue console)
     */
    nextYearlyRain = 0;
    /**
     * Points to the next seasonal rain graph point. Yearly rain always
     * resets at the beginning of the calendar, but seasonal rain resets
     * when rain season begins. For current graph point, just subtract 1
     * (range from 0 to 23 on VP/VP2 console and 0 to 24 on Vantage
     * Vue console)
     */
    nextSeasonalRain = 0;

    /**
     * Points to the next rain storm graph point. For current
     * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
     * console and 0 to 24 on Vantage Vue console)
     */
    nextRainStorm = 0;

    /*
     * Keeps track of the minute within an hour for the rain
     * calculation. (range from 0 to 59)
     * */
    currentMinuteIndex = 0;
}
