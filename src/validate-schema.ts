import Ajv from 'ajv';

type ServerInfo = {
	capabilites: string[];
};

type FedSchema = {
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

function entry() {
	const schema: Record<string, any> = require('../json/config-schema.json');
	const data = require('../json/config.json');
	
	const ajv = new Ajv();
	const validate = ajv.compile(schema);
	const valid = validate(data);
	console.log('valid:', valid);
	if (!valid) {
		console.log('errors:', validate.errors);
		return;
	}

	const fedSchema = data as FedSchema;

	if (fedSchema.services) {
		for (const service of fedSchema.services) {
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
