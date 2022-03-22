export type HighsAndLows = {
    pressure: {
        day: {
            low: number | null;
            high: number | null;
            lowTime: string | null;
            highTime: string | null;
        };
        month: {
            low: number | null;
            high: number | null;
        };
        year: {
            low: number | null;
            high: number | null;
        };
    };
    wind: {
        day: number | null;
        dayTime: string | null;
        month: number | null;
        year: number | null;
    };
    tempIn: {
        day: {
            low: number | null;
            high: number | null;
            lowTime: string | null;
            highTime: string | null;
        };
        month: {
            low: number | null;
            high: number | null;
        };
        year: {
            low: number | null;
            high: number | null;
        };
    };
    humIn: {
        day: {
            low: number | null;
            high: number | null;
            lowTime: string | null;
            highTime: string | null;
        };
        month: {
            low: number | null;
            high: number | null;
        };
        year: {
            low: number | null;
            high: number | null;
        };
    };
    humOut: {
        day: {
            low: number | null;
            high: number | null;
            lowTime: string | null;
            highTime: string | null;
        };
        month: {
            low: number | null;
            high: number | null;
        };
        year: {
            low: number | null;
            high: number | null;
        };
    };
    tempOut: {
        day: {
            low: number | null;
            high: number | null;
            lowTime: string | null;
            highTime: string | null;
        };
        month: {
            low: number | null;
            high: number | null;
        };
        year: {
            low: number | null;
            high: number | null;
        };
    };
    dew: {
        day: {
            low: number | null;
            high: number | null;
            lowTime: string | null;
            highTime: string | null;
        };
        month: {
            low: number | null;
            high: number | null;
        };
        year: {
            low: number | null;
            high: number | null;
        };
    };
    chill: {
        day: number | null;
        dayTime: string | null;
        month: number | null;
        year: number | null;
    };
    heat: {
        day: number | null;
        dayTime: string | null;
        month: number | null;
        year: number | null;
    };
    thsw: {
        day: number | null;
        dayTime: string | null;
        month: number | null;
        year: number | null;
    };
    solarRadiation: {
        month: number | null;
        year: number | null;
        day: number | null;
        dayTime: string | null;
    };
    uv: {
        month: number | null;
        year: number | null;
        day: number | null;
        dayTime: string | null;
    };
    rainRate: {
        month: number | null;
        day: number | null;
        dayTime: string | null;
    };
    rainSum: {
        month: number | null;
        year: number | null;
    };
    extraTemps: [
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        }
    ];
    soilTemps: [
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        }
    ];
    leafTemps: [
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        }
    ];
    extraHums: [
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        }
    ];
    soilMoistures: [
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        }
    ];
    leafWetnesses: [
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        },
        {
            day: {
                low: number | null;
                high: number | null;
                lowTime: string | null;
                highTime: string | null;
            };
            month: {
                low: number | null;
                high: number | null;
            };
            year: {
                low: number | null;
                high: number | null;
            };
        }
    ];
};
