import { Background } from './Background.js';
import { DOMChannel } from '../DOM.js';

export class PageScript {
	constructor() {
		
	}

	register({ whitelist=[''], blacklist=['']}) {
		this.dom = new DOMChannel();
		Background.register({whitelist, blacklist, ref: this});
	}
}