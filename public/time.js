let text = $('.time');
let months = [
    'Jan',
    'Feb',
    'Mar',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Dec'
];

for (let i = 0; i < text.length; i++) {
    if (text.eq(i).text()) {
        let filtered = text
            .eq(i)
            .text()
            .slice(0, 10)
            .split('-');
        let day = filtered[2],
            month = months[parseInt(filtered[1]) - 1],
            year = filtered[0];
        text.eq(i).text(`(${month} ${day}, ${year})`);
    }
}
