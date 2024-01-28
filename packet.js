const fs = require("fs");
const crypto = require("node:crypto");
const { Client } = require("bedrock-protocol");
const { v4: uuidv4 } = require("uuid");

// File Imports
const { deviceOS } = require("./config.json");
const { generateRandomString, getDeviceId, getInputMode } = require("./util.js");

module.exports.packetSend = (realmData) => {
	console.log(`Joining realm: ${realmData.name} (${realmData.id})`);

	let options = {
		host: realmData.ip,
		port: realmData.port,
		profilesFolder: "./authCache",
		skipPing: true,
		skinData: {
			CurrentInputMode: getInputMode(deviceOS),
			DefaultInputMode: getInputMode(deviceOS),
			DeviceId: getDeviceId(deviceOS),
			DeviceModel: 'xbox_series_s',
			DeviceOS: deviceOS,
			PlatformOnlineId: (deviceOS === 12) ? generateRandomString(19, "1234567890") : "",
			PlatformUserId: (deviceOS === 12) ? uuidv4() : "",
			PlayFabId: generateRandomString(16, "qwertyuiopasdfghjklzxcvbnm12345678901"),
            		PersonaPieces: 0xFFFFFFF
		}
	}

	const client = new Client({
		...options
	});

	client.connect();

    	client.once('resource_packs_info', async () => {
        	client.queue('resource_pack_client_response', {
            		response_status: 'completed',
           		resourcepackids: []
        	})
    	})

    	client.on('start_game', async (packet) => {
        	console.log('Joined');
    	})
};
