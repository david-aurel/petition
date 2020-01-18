let c = $('canvas'),
    sig = $('input[name="sig"]'),
    canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    rect = canvas.getBoundingClientRect(),
    x,
    y;

//make canvas resize to width of parent
ctx.canvas.width = c.parent().width();
$(window).resize(function() {
    ctx.canvas.width = c.parent().width();
    sig.val('');
});

// draw with mouse
c.mousedown(e => {
    ctx.strokeStyle = '#0275d8';
    let rect = canvas.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    c.mousemove(e => {
        let newX = e.clientX - rect.left,
            newY = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(newX, newY);
        ctx.stroke();
        (x = newX), (y = newY);
    });
});
c.mouseup(() => {
    let dataURL = canvas.toDataURL();
    sig.val(dataURL);
    c.unbind('mousemove');
});
c.mouseleave(() => {
    let dataURL = canvas.toDataURL();
    sig.val(dataURL);
    c.unbind('mousemove');
});

// draw on mobile
canvas.ontouchstart = e => {
    e.preventDefault();
    ctx.strokeStyle = '#0275d8';
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
};

canvas.ontouchmove = e => {
    e.preventDefault();
    let newX = e.touches[0].clientX - rect.left,
        newY = e.touches[0].clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(newX, newY);
    ctx.stroke();
    ctx.closePath();
    (x = newX), (y = newY);
};

canvas.ontouchend = () => {
    let dataURL = canvas.toDataURL();
    sig.val(dataURL);
};
