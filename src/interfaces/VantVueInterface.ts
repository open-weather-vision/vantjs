import VantPro2Interface from "./VantPro2Interface";

/**
 * Interface to the _Vantage Vue_ weather station. Is built on top of the {@link VantPro2Interface}.
 *
 * Offers station dependent features like {@link getRichRealtimeRecord}, {@link getLOOP}, {@link getLOOP2} and {@link getFirmwareVersion}.
 */
export default class VantVueInterface extends VantPro2Interface {}
