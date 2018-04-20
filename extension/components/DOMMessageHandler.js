// This class runs directly in the DOM; it is added whenever there is at least one Content script running in a page.
class DOMMessageHandler {
	constructor(extensionID) {
		// Connect to the background DOM.js message handler.
		this.port = chrome.runtime.connect(extensionID);
		
		// Listen for any packet changes.
		this.port.onMessage.addListener(this.receive.bind(this));
	}

	// Wrapper to send a message back to the content script who sent the request.
	send(channel, packet, id) {
		this.port.postMessage({ channel, data: packet, id});
	}

	// Listens for an incoming packet.
	receive(packet) {
		// Process the request provided
		switch(packet.data.req) {
			// Return all the variables on the window object
			case 'vars':
				this.send(packet.channel, Object.keys(window), packet.id);
				break;

			// Attach an event to the document object
			case 'event':
				const handler = e => { this.send(packet.channel, e, packet.id); if(packet.data.once) document.removeEventListener(packet.data.name, handler); }
				document.addEventListener(packet.data.name, handler);
				break;

			// Send a packet back when the document is ready.
			//	If the document is already ready when the request is received, send a response back immediately.
			case 'ready': 
				if (document.readyState == 'complete') this.send(packet.channel, null, packet.id);
				else { document.addEventListener('load', e => { this.send(packet.channel, null, packet.id); }); }
				break;

			// Used to retrieve a specific variable from the DOM.
			case 'get_var': 
				this.send(packet.channel, window[packet.data.prop], packet.id);
				break;

			// Used to update a specific variable from the DOM.
			case 'set_var': 
				window[packet.data.prop] = packet.data.value;
				this.send(packet.channel, null, packet.id);
				break;
		}
	}
}

// Get the ExtensionID from the querystring attached to the source of this script.
let eid = document.querySelector('script[src*="eid="]').src.split('eid=')[1].split('&')[0];
// Start up the message handler.
new DOMMessageHandler(eid);