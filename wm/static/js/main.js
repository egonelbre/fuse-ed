var tau = Math.PI * 2,
    abs = Math.abs;

var body = document.body,
    canvas = document.getElementById('view'),
    ctx = canvas.getContext('2d');

document.body.clientWidth; // fix bug in webkit: http://qfox.nl/weblog/218

var main = Window.make(),
    styles = ButtonPanel.make(),
    controls = ButtonPanel.make(),
    checkpoints = ButtonPanel.make(),
    huds = HUDStack.make();

checkpoints.side = "bottom";
checkpoints.width = 60;
styles.side = "right";
styles.width = 60;
controls.side = "left";
controls.pad = 50;

main.add("checkpoints", checkpoints);
main.add("styles", styles);
main.add("controls", controls);
main.add("huds", huds);

controls.add(Button.make("C", {
    down : function(){ main.controls.control = true; },
    up : function(){ main.controls.control = false; }
}));
controls.add(Button.make("S", {
    down : function(){ main.controls.shift = true; },
    up : function(){ main.controls.shift = false; }
}));
controls.add(Button.make("A", {
    down : function(){ main.controls.alt = true; },
    up : function(){ main.controls.alt = false; }
}));

styles.add(Button.make("1"));
styles.add(Button.make("2"));
styles.add(Button.make("3"));

var render = function(){
    main.update();
    //window.requestAnimationFrame(render);
}

fps = 24;
last = 0;
function requestRender(){
    setTimeout(function(){
        window.cancelAnimationFrame(last);
        last = window.requestAnimationFrame(render);
    }, 1000/fps);
}

setInterval(requestRender, 1000);
requestRender();
