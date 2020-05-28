const cypress = require('cypress');
const marge = require('mochawesome-report-generator');
const { merge } = require('mochawesome-merge');
const fs = require('fs');
const { ncp } = require('ncp');
const glob = require('glob');

let SPECS = process.env.SPECS || process.argv[2];
const BROWSER = process.env.BROWSER || process.argv[3];
const ENV = process.env.ENV || process.argv[4];
const PODINDEX = process.env.PODINDEX || null;

const specs = {};
const pods = 2;
let lastIndex = 0;
const arrSpec = glob.sync('cypress/integration/**/*.js', {});

if (!SPECS) {
    for (let i = 0; i < pods; i += 1) {
        const nextIndex = lastIndex + Math.floor(arrSpec.length / pods);
        if (i === pods - 1 && nextIndex !== arrSpec.length) {
            specs[`pod${i}`] = arrSpec.slice(lastIndex, arrSpec.length);
        } else {
            specs[`pod${i}`] = arrSpec.slice(lastIndex, nextIndex);
        }
        lastIndex = nextIndex;
    }

    SPECS = PODINDEX ? specs[`pod${PODINDEX}`] : [];
}


function generateReport() {
    return merge().then((report) => marge.create(report));
}

function especialCharMask(str) {
    let especialChar = str.replace(/[áàãâä]/g, 'a');
    especialChar = especialChar.replace(/[éèêë]/g, 'e');
    especialChar = especialChar.replace(/[íìîï]/g, 'i');
    especialChar = especialChar.replace(/[óòõôö]/g, 'o');
    especialChar = especialChar.replace(/[úùûü]/g, 'u');
    especialChar = especialChar.replace(/[ç]/g, 'c');
    especialChar = especialChar.replace(/_+/g, '_');
    especialChar = especialChar.replace(/["?Ì§Ì]/g, '');
    especialChar = especialChar.replace(/[\u0083]/g, '');
    especialChar = especialChar.replace(/[\u0081]/g, '');
    return especialChar;
}

cypress.run({
    browser: BROWSER,
    headless: true,
    spec: SPECS,
    env: {
        configFile: ENV,
    },
}).then((results) => {
    generateReport();

    if (fs.existsSync('./cypress/snapshots/actual')) {
    // normalize folder
        const folder = glob.sync('cypress/snapshots/actual/**/', {});

        folder.forEach((folderName) => {
            const newName = especialCharMask(folderName);
            fs.renameSync(folderName, newName);
        });

        // normalize image name
        const image = glob.sync('cypress/snapshots/actual/**/**.png', {});

        image.forEach((file) => {
            const newName = especialCharMask(file);
            fs.renameSync(file, newName);
        });

        ncp.limit = 2;

        ncp('./cypress/snapshots/actual', './mochawesome-report/assets', (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log('done!');
            }
        });
    }

    const resultObj = {
        failures: results.totalFailed,
    };
    const data = JSON.stringify(resultObj);
    fs.writeFileSync('json_result.json', data);
}).catch((err) => {
    generateReport();
    console.error(err);
});
