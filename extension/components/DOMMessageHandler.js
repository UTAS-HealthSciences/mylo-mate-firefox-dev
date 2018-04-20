class DOMMessageHandler {
	constructor(extensionID) {
		this.port = chrome.runtime.connect(extensionID);
		this.port.onMessage.addListener(this.receive.bind(this));
	}

	send(channel, packet, id) {
		this.port.postMessage({ channel, data: packet, id});
	}

	receive(packet) {
		switch(packet.data.req) {
			case 'vars':
				this.send(packet.channel, Object.keys(window), packet.id);
				break;

			case 'event':
				document.addEventListener(packet.data.name, e => {
					this.send(packet.channel, e, packet.id);
				});
				break;

			case 'ready': 
				if (document.readyState == 'complete') this.send(packet.channel, null, packet.id);
				else {
					document.addEventListener('load', e => {
						this.send(packet.channel, null, packet.id);
					});
				}
				break;

			case 'get_var': 
				this.send(packet.channel, window[packet.data.prop], packet.id);
				break;

			case 'set_var': 
				window[packet.data.prop] = packet.data.value;
				this.send(packet.channel, null, packet.id);
				break;
		}
	}
}

let eid = document.querySelector('script[src*="eid="]').src.split('eid=')[1].split('&')[0];
new DOMMessageHandler(eid);