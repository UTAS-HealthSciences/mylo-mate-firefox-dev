import { guid } from './utils/Utils.js';

export class DOMChannel {
	constructor() {
		this.ChannelID = guid();
		chrome.runtime.onConnectExternal.addListener(port => {
			this.port = port;
			let self = this;
			this.post({req: 'ready'})
				.then(() => this.post({ req: 'vars' }))
				.then(vars => this.doc = new Proxy({}, {
					has: function (target, key) { return vars.includes(prop) },
					get: async function(target, prop) {
						if (vars.includes(prop)) { return await self.post({req: 'get_var', prop }); }
						else return undefined;
					},
					set: function(obj, prop, value) { self.post({req: 'set_var', prop, value }); }
				}));
		});
		console.log(this);
	}

	on(event, cb) {
		this.post({req: 'event', name: event}).then(cb);
	}

	post(packet) {
		return new Promise((resolve, reject) => { 
			let id = guid();
			const handler = (msg) => { 
				if (msg.channel == this.ChannelID && msg.id == id) { 
					resolve(msg.data); 
					this.port.onMessage.removeListener(handler);
				} 
			}
			this.port.onMessage.addListener(handler);
			this.port.postMessage({ channel: this.ChannelID, data: packet, id });
		});
	}
}