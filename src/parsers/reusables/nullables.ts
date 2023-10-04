const nullables = {
    uv: [255],
    pressure: [0],
    humidity: [0, 255, -1],
    time: [65535],
    temperature: [32767],
    heat: [-32768],
    thsw: [-32768],
    chill: [32768],
    solar: [32767, 32768],
    tempExtra: [255, -1],
    soilTemp: [255, -1],
    leafTemp: [255, -1],
    leafWetness: [255, -1],
    soilMoisture: [255, -1],
    tempLow: [32767],
    tempHigh: [-32768],
};

export default nullables;
