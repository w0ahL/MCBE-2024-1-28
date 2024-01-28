const { NIL, v3: uuidv3, v4: uuidv4, v5: uuidv5 } = require("uuid");

function generateRandomString(length, characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_-") {
	const charArray = Array.from(characters);

	let result = "";

	for (let i = 0; i < length; i++) {
		result += charArray[Math.floor(Math.random() * charArray.length)];
	}

	return result;
}

function getDeviceId(deviceOS) {
	const deviceIdMap = {
		1: uuidv4().replace(/-/g, ""),
		2: uuidv4().replace(/-/g, "").toUpperCase(),
		7: uuidv3(uuidv4(), NIL),
		8: uuidv3(uuidv4(), NIL),
		11: uuidv3(uuidv4(), NIL),
		12: uuidv5(uuidv4(), NIL),
		13: `${generateRandomString(43, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890/+")}=`
	};

	return deviceIdMap[deviceOS] || uuidv4();
}

async function getInputMode(deviceOS) {
	if (deviceOS === 10 || deviceOS === 11 || deviceOS === 12 || deviceOS === 13) {
		return 3;
	} else if (deviceOS === 1 || deviceOS === 2 || deviceOS === 4 || deviceOS === 14) {
		return 2;
	} else if (deviceOS === 3 || deviceOS === 7 || deviceOS === 8 || deviceOS === 15) {
		return 1;
	} else if (deviceOS === 5 || deviceOS === 6) {
		return 4;
	} else if (deviceOS === 9 || deviceOS === 0) {
		return 0;
	}
}

module.exports = {
    generateRandomString,
    getDeviceId,
    getInputMode
};