const fs = require("fs");
const fetch = require("node-fetch");
const prompt = require("prompt-sync")();
const { Authflow, Titles } = require("prismarine-auth");

const { packetSend } = require("./packet.js");

const flow = new Authflow(undefined, "./authCache", {
	flow: "live",
	authTitle: Titles.MinecraftNintendoSwitch,
	deviceType: "Nintendo",
	doSisuAuth: true
});

const realm_api_headers = {
	"Accept": "*/*",
	"authorization": "",
	"charset": "utf-8",
	"client-ref": "08bdb049f310d03aeabda3748f857640eb62a733",
	"client-version": "1.20.51",
	"content-type": "application/json",
	"user-agent": "MCPE/UWP",
	"Accept-Language": "en-CA",
	"Accept-Encoding": "gzip, deflate, br",
	"Host": "pocket.realms.minecraft.net",
	"Connection": "Keep-Alive"
};

(async () => {
	try {
		const xboxToken = await flow.getXboxToken("https://pocket.realms.minecraft.net/")
			.catch((err) => {
				console.log(err);
				process.exit(0);
			});

		realm_api_headers.authorization = `XBL3.0 x=${xboxToken.userHash};${xboxToken.XSTSToken}`;

		const worlds = await fetch("https://pocket.realms.minecraft.net/worlds", {
			method: "GET",
			headers: realm_api_headers
		});

		const allRealms = (await worlds.json()).servers;

		allRealms.sort((a, b) => a.id - b.id);

		for (const i in allRealms) {
			const realm = allRealms[i];

			if (realm.state === "CLOSED" || realm.expired) continue;

			console.log(`${Number(i) + 1}. ${realm.name}`);
		}

		const selection = Number(prompt("Please type in the number for the realm, or the realm ID: "));

		let realm = {};

		if (selection < 10000) {
			realm = allRealms[selection - 1];
		} else {
			realm = allRealms.find(realmData => realmData.id === selection);
		}

		if (!realm) {
			console.log("Invalid choice.");
			process.exit(0);
		}

		const response = await fetch(`https://pocket.realms.minecraft.net/worlds/${realm.id}/join`, {
			method: "GET",
			headers: realm_api_headers
		}).catch(() => { });

		if (!response || (response.status !== 200 && response.status !== 403)) {
			console.log(response?.status);
			console.log(await response?.text());
			process.exit(0);
		}

		const realmIP = await response.json();

		if (realmIP.errorMsg) {
			console.log(realmIP.errorMsg);
			process.exit(0);
		}

		realm.ip = realmIP.address.substring(0, realmIP.address.indexOf(':'));
		realm.port = Number(realmIP.address.substring(realmIP.address.indexOf(':') + 1));

		packetSend(realm);
	} catch (err) {
		console.log(err);
		process.exit(0);
	}
})();