export class BrokerSettings {
	constructor (object) {
		this.id = object.id;
		this.name = object.name;
		this.scanningEnabled = object.scanningEnabled;
		this.autoInvoicingEnabled = object.autoInvoicingEnabled;
		this.allowScanningToggle = object.allowScanningToggle;
		this.type = object.type;
		this.fleetId = object.fleetId;
		this.code = object.code;
		this.isFavorite = object.isFavorite;
		this.commandCarrierId = object.commandCarrierId;
		this.carrierBrokerSettingsId = object.carrierBrokerSettingsId;
	};
	id: number;
    name: string;
    scanningEnabled: boolean;
	autoInvoicingEnabled: boolean;
	allowScanningToggle: boolean;
    type: string;
    fleetId: string;
    code: string;
    isFavorite: string;
    commandCarrierId: number;
    carrierBrokerSettingsId: number;
}