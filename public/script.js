let c = $('canvas'),
    sig = $('input[name="sig"]'),
    canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d');

c.mouseenter(() => {
    c.mousedown(e => {
        let x = e.pageX - e.target.offsetLeft,
            y = e.pageY - e.target.offsetTop;

        c.mousemove(e => {
            let newX = e.pageX - e.target.offsetLeft,
                newY = e.pageY - e.target.offsetTop;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(newX, newY);
            ctx.stroke();
            (x = newX), (y = newY);
        });
    });
    c.mouseup(() => {
        var dataURL = canvas.toDataURL();
        sig.val(dataURL);
        console.log(sig.val());

        c.unbind('mousemove');
    });
    c.mouseleave(() => {
        c.unbind('mousemove');
    });
});
