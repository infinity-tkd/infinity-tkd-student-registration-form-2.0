import fs from 'fs';
import https from 'https';

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch ${url}, status: ${res.statusCode}`));
                return;
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function buildLocations() {
    try {
        console.log("Fetching Cambodia Provinces...");
        const provinces = await fetchJson('https://raw.githubusercontent.com/NorakGithub/cambodia-gazetteer/main/provinces.json');
        
        let cambodiaTree = {};
        
        for (const prov of provinces) {
            console.log(`Fetching details for province: ${prov.english}`);
            const provDetail = await fetchJson(`https://raw.githubusercontent.com/NorakGithub/cambodia-gazetteer/main/provinces/${prov.id}.json`);
            
            let districtsTree = {};
            for (const dist of provDetail) {
                let communesList = [];
                if (dist.communes && Array.isArray(dist.communes)) {
                    for (const comm of dist.communes) {
                        communesList.push({
                            english: comm.english || comm.local,
                            local: comm.local || comm.english
                        });
                    }
                }
                districtsTree[dist.english || dist.local] = {
                    local: dist.local || dist.english,
                    communes: communesList
                };
            }
            cambodiaTree[prov.english] = {
                local: prov.local || prov.english,
                districts: districtsTree
            };
        }


        console.log("Fetching Countries and Nationalities...");
        const countries = await fetchJson('https://restcountries.com/v3.1/all?fields=name,demonyms');
        
        let countryList = countries.map(c => c.name.common).sort();
        let nationalityList = countries.map(c => c.demonyms?.eng?.m).filter(Boolean).sort();
        nationalityList = [...new Set(nationalityList)]; // Remove duplicates
        
        if (!countryList.includes("Cambodia")) {
            countryList.push("Cambodia");
            countryList.sort();
        }
        
        countryList = countryList.filter(Boolean);
        nationalityList = nationalityList.filter(Boolean);

        const finalJS = `// Generated Location Data
"use strict";

export const cambodiaLocations = ${JSON.stringify(cambodiaTree, null, 4)};

export const countryList = ${JSON.stringify(countryList, null, 4)};

export const nationalityList = ${JSON.stringify(nationalityList, null, 4)};
`;
        
        if (!fs.existsSync('./src/data')){
            fs.mkdirSync('./src/data', { recursive: true });
        }
        
        fs.writeFileSync('./src/data/locations.js', finalJS, 'utf8');
        console.log("Successfully generated src/data/locations.js!");
    } catch (err) {
        console.error("Error building locations:", err);
    }
}

buildLocations();
