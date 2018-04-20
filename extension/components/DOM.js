import { guid } from './utils/Utils.js';

// This structure provides a transparent layer to access the DOMs variables.
//	Still needs doing: find a way to serialize and transmit DOM nodes. Hmm.
export class DOMChannel {
	constructor() {
		// Create a unique, custom GUID for this communications channel.
		//	This is better than using Date.now, as it means multiple calls can be done in the same millisecond and still have unique ID's.
		this.ChannelID = guid();

		// Listen for when our other half, 'DOMMessageHandler.js' is loaded and ready, and connects back to us.
		chrome.runtime.onConnectExternal.addListener(port => {
			this.port = port; let self = this;
			
			// Wait until the DOM is ready
			this.post({req: 'ready'})
				// Build a proxy based on these elements.
				.then(vars => this.doc = new Proxy({}, {
					// Check against the window object to see if the variable exists.
					has: function (target, key) { 
						let vars = await this.post({ req: 'vars' });
						return vars.includes(prop);
					},
					// Get the variable directly from the DOM
					get: async function(target, prop) {
						return await self.post({req: 'get_var', prop });
					},
					// Set the variable on the DOM
					set: function(obj, prop, value) { self.post({req: 'set_var', prop, value }); }
				}));
		});
	}

	// Set an event handler to occur on the document.
	//	This might get fleshed out later to allow it to attach to live nodes (checks nodes event at time of event occuring).
	on(event, cb, once) {
		this.post({req: 'event', name: event, once}).then(cb);
	}

	// Posts a packet to the DOM and waits for it to get a direct response (based on Channel and PacketID).
	// Once it receives a response, it will return a Resolved Promise, which can be captured with a .then() or an await.
	post(packet) {
		return new Promise((resolve, reject) => { 
			let id = guid();
			const handler = (msg) => { 
				if (msg.channel == this.ChannelID && msg.id == id) { resolve(msg.data); this.port.onMessage.removeListener(handler); } 
			}
			this.port.onMessage.addListener(handler);
			this.port.postMessage({ channel: this.ChannelID, data: packet, id });
		});
	}
}