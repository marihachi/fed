import Ajv, { ValidateFunction } from 'ajv';
import { err, ok } from './misc/result';

type ServerInfo = {
	capabilites: string[];
};


type FedDescription = {
	services?: FedSchemaService[];
};

type FedSchemaService = {
	name: string;
	components?: (FedSchemaComponent | string)[];
};

type FedSchemaComponent = {
	name: string;
	objects?: FedSchemaObject[];
	events?: FedSchemaEvent[];
	actions?: FedSchemaAction[];
};

type FedSchemaObject = {
	name: string;
	props?: FedSchemaObjectProp[];
};

type FedSchemaObjectProp = {
	name: string;
	type: string;
};

type FedSchemaEvent = {
	name: string;
};

type FedSchemaAction = {
	name: string;
};

class Fed {
	private validateSchema: ValidateFunction;

	constructor() {
		const schema = require('../json/descriptor-schema.json');
		const ajv = new Ajv();
		this.validateSchema = ajv.compile(schema);
	}

	loadDescription(src: object) {
		if (typeof src == 'string') {
			src = JSON.parse(src) ;
		}
		const valid = this.validateSchema(src);
		if (!valid) {
			return err('invalid-description-data');
		}

		return ok(src as FedDescription);
	}
}

function entry() {
	const fed = new Fed();

	const data = require('../json/descriptor.json');
	const loadResult = fed.loadDescription(data);
	if (!loadResult.success) {
		console.log('loading error:', loadResult.err);
		return;
	}
	const description = loadResult.value;
	console.log('loaded');

	if (description.services) {
		for (const service of description.services) {
			console.log('service:', service.name);
			if (service.components) {
				for (const component of service.components) {
					if (typeof component == 'string') {
						console.log(' component url:', component);
					}
					else {
						console.log(' component:', component.name);
						if (component.objects) {
							for (const obj of component.objects) {
								console.log('  object:', obj.name);
							}
						}
						if (component.actions) {
							for (const action of component.actions) {
								console.log('  action:', action.name);
							}
						}
						if (component.events) {
							for (const ev of component.events) {
								console.log('  event:', ev.name);
							}
						}
					}
				}
			}
		}
	}
}

entry();
