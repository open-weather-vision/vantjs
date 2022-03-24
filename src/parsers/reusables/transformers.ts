const transformers = {
    alarm: (value: number) => value === 1,
    temperature: (value: number) => value / 10,
    time: (value: number) => {
        const stringValue = value.toString();
        switch (stringValue.length) {
            case 1:
                return `00:0${stringValue}`;
            case 2:
                return `00:${stringValue}`;
            case 3:
                return `0${stringValue.charAt(0)}:${stringValue.substring(1)}`;
            case 4:
                return `${stringValue.substring(0, 2)}:${stringValue.substring(
                    2
                )}`;
        }
        return value;
    },
    hex: (value: number) => `0x${value.toString(16)}`,
    uv: (value: number) => value / 10,
    extraTemp: (value: number) => value - 90,
    soilTemp: (value: number) => value - 90,
    leafTemp: (value: number) => value - 90,
    dayET: (value: number) => value / 1000,
    monthET: (value: number) => value / 100,
    yearET: (value: number) => value / 100,
    pressure: (value: number) => {
        if (value < 20_000 || value > 32_500) return null;
        else return value / 1000;
    },
    stormStartDate: (value: number) => {
        const day = (0x0f80 & value) >> 7;
        const month = (0xf000 & value) >> 12;
        const year = (0x007f & value) + 2000;
        return new Date(`${year}-${month}-${day}`);
    },
};

export default transformers;
