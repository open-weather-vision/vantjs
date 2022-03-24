import units from "typesafe-units";
import { UnitString } from "typesafe-units/dist/UnitString";

export default function (value: number | null, unit: UnitString) {
    if (value === null) {
        return null;
    } else {
        return units.Convertible(value, unit);
    }
}
