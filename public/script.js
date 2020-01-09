let c = $('canvas');

c.mouseenter(() => {
    c.on('mousedown', e => {
        var x = e.pageX - e.target.offsetLeft;
        var y = e.pageY - e.target.offsetTop;

        c.mousemove(() => {
            console.log('move: ', x, y);
        });
    });
    c.on('mouseup', () => {
        c.unbind('mousemove');
    });
    c.on('mouseleave', () => {
        c.unbind('mousemove');
    });
});
