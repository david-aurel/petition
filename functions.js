const db = require('./db');

exports.filterResults = () => {
    return db.getSigs().then(results => {
        console.log('results:', results);
        let filtered = [];
        for (let i = 0; i < results.length; i++) {
            let first = results[i].first;
            let last = results[i].last;
            let fullName = `${first} ${last}`;
            let message = results[i].msg;
            let time = results[i].time;

            filtered.push({ fullName, message, time });
        }
        console.log('filtered: ', filtered);
        return filtered;
    });
};

// function filterResults() {
//     db.getSigs().then(results => {
//         let signers = [];
//         for (let i = 0; i < results.length; i++) {
//             signers.push(results[i].first);
//         }
//         console.log('signers: ', signers);
//         return signers;
//     });
// }
// filterResults();
