const db = require('./db');

exports.filterResults = () => {
    return db.getSigs().then(results => {
        let filtered = [];
        for (let i = 0; i < results.length; i++) {
            let first = results[i].first;
            let last = results[i].last;
            let fullName = `${first} ${last}`;
            let message = results[i].msg;

            filtered.push({ fullName, message });
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
