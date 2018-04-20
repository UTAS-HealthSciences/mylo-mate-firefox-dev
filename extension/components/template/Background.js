import { wildcard } from '../utils/Utils.js';

class BackgroundManager {
	constructor() {
		this._urls = [];
		chrome.tabs.onUpdated.addListener(ChromeEvents.TabUpdated);
	}

	register({whitelist = [''], blacklist = [''], ref = {}}) {
		if(!Array.isArray(whitelist)) whitelist = [whitelist];
		if(!Array.isArray(blacklist)) blacklist = [blacklist];
		this._urls.push({whitelist, blacklist, ref});
	}

	static GetScripts(url) {
		if(url === undefined) return false;
		let matches = [];
		Background._urls.forEach(reg => {
			const whitelist = reg.whitelist.some(u => url.match(wildcard(u)));
			const blacklist = reg.blacklist.some(u => url.match(wildcard(u)));
			if(whitelist && !blacklist) matches.push(reg);
		});
		return matches;
	}
}

class ChromeEvents {
	static TabUpdated(TabID, change, tab) {
		if(change.status !== 'complete') return;
		let objects = BackgroundManager.GetScripts(tab.url)
		let domobj = {};
		if(objects.length > 0) { 
			const InsertURLCode = (url) => `let s = document.createElement('script'); s.src="${url}?eid=${encodeURIComponent(chrome.runtime.id)}"; s.setAttribute('mm-purpose', 'dom-messenger'); s.type="module"; document.head.appendChild(s);`;
			chrome.tabs.executeScript(TabID, {code: InsertURLCode(chrome.runtime.getURL('/components/DOMMessageHandler.js'))}); 
		}
		objects.forEach(URLObject => {
			URLObject.ref.run();
		});
	}
}

export const Background = new BackgroundManager();