import { PageScript } from '../template/PageScript.js';

class RoleCheck extends PageScript {
	constructor() {
		super();
		super.register({whitelist: ['https://mylo.utas.edu.au/d2l/*', 'https://d2ldev2.utas.edu.au/d2l/*']});
	}

	run() {
		console.log('The RoleCheck script is running!');
	}
}

new RoleCheck();