let c = $('canvas'),
    sig = $('input[name="sig"]'),
    canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d');

//make canvas resize to width of parent
ctx.canvas.width = c.parent().width();
$(window).resize(function() {
    ctx.canvas.width = c.parent().width();
    sig.val('');
});

c.mousedown(e => {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    c.mousemove(e => {
        let newX = e.clientX - rect.left,
            newY = e.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(newX, newY);
        ctx.strokeStyle = '#0275d8';
        ctx.stroke();
        (x = newX), (y = newY);
    });
});
c.mouseup(() => {
    var dataURL = canvas.toDataURL();
    sig.val(dataURL);
    c.unbind('mousemove');
});
