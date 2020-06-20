const http = require('http');
const querystring = require('querystring');

const webapiKey = process.env.WEBAPI_KEY;
const userSteamID = process.env.USER_STEAMID;

const queryParameters = {
    key: webapiKey,
    steamid: userSteamID
};

console.log("TF2 Ref Amount Fetcher");
console.log('Fetching inventory...');

http.get({
    host: 'api.steampowered.com',
    port: 80,
    path: '/IEconItems_440/GetPlayerItems/v0001/?'+ querystring.stringify(queryParameters)
}, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.log("HTTP Error: " + res.statusCode);
        } else {
            try {
                const parsedData = JSON.parse(rawData);
                let metals = countMetal(parsedData.result.items);

                console.log("Scrap Metal: " + metals[5000]);
                console.log("Reclaimed Metal: " + metals[5001]);
                console.log("Refined Metal: " + metals[5002]);
                console.log('Metal Value: ' + getMetalValue(metals[5000], metals[5001], metals[5002]) + ' Ref');
            } catch (e) {
                console.error(e.message);
            }
        }
    });
});

function countMetal(items) {
    let metals = {
        5000: 0, // Scrap
        5001: 0, // Reclaimed
        5002: 0, // Refined
    };

    if (items) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].defindex >= 5000 && items[i].defindex <= 5002) {
                metals[items[i].defindex] += 1;
            }
        }
    }

    return metals;
}

function getMetalValue(scrapCount, recCount, refCount) {
    let value = 0;
    while (scrapCount >= 3) {
        scrapCount = scrapCount - 3;
        recCount++;
    }

    while (recCount >= 3) {
        recCount = recCount - 3;
        refCount++;
    }

    value += scrapCount * 0.11;
    value += recCount * 0.33;
    value += refCount;

    return value;
}
