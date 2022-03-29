const nullables = {
    uv: [255],
    pressure: [0],
    humidity: [0, 255],
    time: [65535],
    temperature: [32767],
    heat: [-32768],
    thsw: [-32768],
    chill: [32768],
    solar: [32767, 32768],
    extraTemp: [255],
    soilTemp: [255],
    leafTemp: [255],
    leafWetness: [255],
    soilMoisture: [255],
    tempLow: [32767],
    tempHigh: [-32768],
};

export default nullables;
