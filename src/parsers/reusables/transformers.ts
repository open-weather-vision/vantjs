import { TransformerCollection } from "../../util/BinaryParser";

const transformers: TransformerCollection = {
    alarm: (value) => value === 1,
    temperature: (value) => value / 10,
    time: (value) => {
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
    hex: (val) => `0x${val.toString(16)}`,
    uv: (value) => value / 10,
    extraTemp: (value) => value - 90,
    soilTemp: (value) => value - 90,
    leafTemp: (value) => value - 90,
    pressure: (value) => {
        if (value < 20_000 || value > 32_500) return null;
        else return value / 1000;
    },
    stormStartDate: (value) => {
        const day = (0x0f80 & value) >> 7;
        const month = (0xf000 & value) >> 12;
        const year = (0x007f & value) + 2000;
        return new Date(`${year}-${month}-${day}`);
    },
};

export default transformers;
