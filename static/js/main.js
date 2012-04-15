var body = document.body,
    canvas = document.getElementById('main'),
    ctx = canvas.getContext('2d');
document.body.clientWidth; // fix bug in webkit: http://qfox.nl/weblog/218

body.onload=window.onload=window.onresize = function(e){
    main.size = {x:canvas.clientWidth, y:canvas.clientHeight};
    canvas.setAttribute("width", main.size.x + "px");
    canvas.setAttribute("height", main.size.y + "px");
    modified();
}

tau = Math.PI * 2;
abs = Math.abs;

colors = {
    selection : "rgba(255, 20, 20, 0.6)"
}

main = {
    size : {x:0, y:0},
    canvas : canvas,
    ctx : ctx,
    hudManager : null,
    render : function(){
        this.ctx.clearRect(0, 0, this.size.x, this.size.y);
        if (this.hudManager)
            this.hudManager.render(this.ctx);
    },
    mouseAction : function(action, e){
        if (this.hudManager)
            this.hudManager.mouseAction(action, e);
    },
    keyAction : function(action, e){
        if (this.hudManager)
            this.hudManager.keyAction(action, e);
    }
};

main.hudManager = {
    huds : [],
    exclusiveHud : null,
    render : function(ctx){
        for(var i = 0; i < this.huds.length; i += 1){
            var hud = this.huds[i];
            if (hud.enabled && hud.render)
                hud.render(ctx);
        }
    },
    mouseAction : function(action, e){
        if (this.exclusiveHud && this.exclusiveHud.mouseAction)
            this.exclusiveHud.mouseAction(action, e);
        if( !this.exclusiveHud )
        for(var i = 0; i < this.huds.length; i += 1){
            var hud = this.huds[i];
            if (hud.enabled && hud.mouseAction)
                hud.mouseAction(action, e);
            if(this.exclusiveHud) break;
        }
    },
    keyAction : function(action, e){
        if (this.exclusiveHud && this.exclusiveHud.keyAction)
            this.exclusiveHud.keyAction(action, e);
        if( !this.exclusiveHud )
        for(var i = 0; i < this.huds.length; i += 1){
            var hud = this.huds[i];
            if (hud.enabled && hud.keyAction)
                hud.keyAction(action, e);
            if(this.exclusiveHud) break;
        }
    }
}

input = {
    mouse : {pos:{x:0, y:0}, down:false},
    keys : { control : false, shift : false }
}

diagram = {
    selection : [],
    objects : [],
    styles : [],
    renderType : function(ctx, type){
        this.objects.seqOf(type, function(obj){
            obj.render(ctx);
        });
    },
    render : function(ctx){
        this.renderType(ctx, Rectangle);
    },
    renderConnections: function(ctx){
        this.renderType(ctx, Connection);
    },
    renderConnectors: function(ctx){
        this.objects.seqOf(null, function(obj){
            obj.renderConnectors(ctx);
        });
    },
    findObjectOfType : function(pos, type){
        return this.objects.seqReverseOf(type, function(obj){
            if(obj.inside(pos))
                return obj;
        });
    },
    findObject : function(pos){
        var obj;
        obj = this.findObjectOfType(pos, Rectangle);
        if(obj) return obj;
        return this.findObjectOfType(pos, null);
    }
};

createStyles = function(arr){
    var res = [];
    for(var i = 0; i < arr.length; i += 1){
        res.push(new Style(arr[i][0],arr[i][1],arr[i][2],arr[i][3], arr[i][4]));
    }
    return res;
}

diagram.styles = createStyles([
    ["Butter", "#FCE94F", "#EDD400", "#C4A000", 2],
    ["Orange", "#FCAF3E", "#F57900", "#CE5C00", 2],
    ["Chocolate", "#E9B96E", "#C17D11", "#8F5902", 2],
    ["Chameleon", "#8AE234", "#73D216", "#4E9A06", 2],
    ["Sky Blue", "#729FCF", "#3465A4", "#204A87", 2],
    ["Plum", "#AD7FA8", "#75507B", "#5C3566", 2],
    ["Scarlet Red", "#EF2929", "#CC0000", "#A40000", 2],
    ["Aluminium", "#EEEEEC", "#D3D7CF", "#BABDB6", 2],
    ["Dark Aluminium", "#888A85", "#555753", "#2E3436", 2],
]);

function Style(name, prime, second, third, width){
    this.name = name;
    this.prime = prime || "hsla(60, 60%, 60%, 0.3)";
    this.second = second || "hsla(60, 60%, 60%, 0.3)";
    this.third = third || "hsla(60, 60%, 60%, 0.3)";
    this.lineWidth = width || 3;
}

Style.prototype.assignProp = function(obj, prop){
    if(obj.hasOwnProperty(prop))
        obj[prop] = this[prop];
}

Style.prototype.assign = function(objs){
    for(var i = 0; i < objs.length; i += 1){
        var obj = objs[i];
        this.assignProp(obj, "prime");
        this.assignProp(obj, "second");
        this.assignProp(obj, "third");
    }
}

Style.prototype.render = function(ctx, rect){
    ctx.fillStyle = this.prime;
    ctx.strokeStyle = this.third;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.rect(rect.pos.x, rect.pos.y, rect.size.x, rect.size.y);
    ctx.fill();
    ctx.stroke();
}

function Connection(from, to){
    this.from = from;
    this.to = to;
    this.prime = this.from.owner.prime;
    this.second = this.from.owner.second;
    this.third = this.from.owner.third;
}

Connection.prototype.render = function(ctx){
    var from = this.from.getPos(),
        to = this.to.getPos();

    ctx.strokeStyle = this.third;
    ctx.fillStyle = this.prime;
    ctx.arrow([from, to], 10, 1);
}

Connection.prototype.renderSelection = function(ctx){
    var pad = 10,
        from = this.from.getPos(),
        to = this.to.getPos(),
        padx = from.x > to.x ? -pad : pad,
        pady = from.y > to.y ? -pad : pad;
    
    ctx.beginPath();
    ctx.rect(from.x - padx, from.y - pady, 
             to.x - from.x + 2*padx, to.y - from.y + 2*pady);
    ctx.stroke();
}

Connection.prototype.inside = function(pos){
    var from = this.from.getPos(),
        to = this.to.getPos();

    return V.nearToLine(from, to, pos, 15);
}

Connection.prototype.getConnectors = function(){
    return [];
}

Connection.prototype.renderConnectors = function(ctx){
}

function Connector(obj, pos){
    this.owner = obj;
    this.pos = pos;
    this.radius = 25;
}

Connector.prototype.getPos = function(){
    return {x:this.owner.pos.x + this.pos.x, y:this.owner.pos.y + this.pos.y};
}

Connector.prototype.render = function(ctx){
    var pos = this.getPos();

    ctx.fillStyle = this.owner.prime;
    ctx.strokeStyle = this.owner.third;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.radius, 0, tau, 0);
    ctx.fill();
    ctx.stroke();
}

Connector.prototype.inside = function(pos){
    var p = this.getPos();
    return (abs(p.x - pos.x) < this.radius) && (abs(p.y - pos.y) < this.radius);
}

function Rectangle(pos, size){
    this.prime = "hsla(60, 60%, 60%, 0.9)";
    this.second = this.prime;
    this.third = "hsla(60, 60%, 30%, 0.9)";
    this.lineWidth = 2;
    this.pos = {x:0,y:0};
    this.pos.x = size.x < 0 ? pos.x + size.x : pos.x;
    this.pos.y = size.y < 0 ? pos.y + size.y : pos.y;
    this.size = {x:Math.abs(size.x), y : Math.abs(size.y)};

    this.connectors = [];
    if(size.x > 50){
        for(var y = 25; y < size.y; y += 50){
            this.connectors.push(new Connector(this, {x:10, y:y}));
            this.connectors.push(new Connector(this, {x:size.x-10, y:y}));
        }
    } else {
        for(var y = 5; y < size.y; y += 50){
            this.connectors.push(new Connector(this, {x:size.x-25, y:y}));
        }
    }    
};

Rectangle.prototype.render = function(ctx){
    ctx.fillStyle = this.prime;
    ctx.strokeStyle = this.third;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    ctx.fill();
    ctx.stroke();
}

Rectangle.prototype.bounds = function(){
    return {pos:this.pos, size:this.size};
}

Rectangle.prototype.inside = function(pos){
    return (this.pos.x < pos.x) && (pos.x < this.pos.x + this.size.x) &&
           (this.pos.y < pos.y) && (pos.y < this.pos.y + this.size.y);
}

Rectangle.prototype.getConnectors = function(){
    return this.connectors;
}

Rectangle.prototype.renderConnectors = function(ctx){
    for(var i = 0; i < this.connectors.length; i += 1){
        this.connectors[i].render(ctx);
    }
}

Rectangle.prototype.renderSelection = function(ctx){
    ctx.beginPath();
    ctx.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    ctx.stroke();
}

Rectangle.prototype.clone = function(){
    var r = new Rectangle(this.pos, this.size, this.prime);
    r.prime = this.prime;
    r.second = this.second;
    r.third = this.third;
    this.lineWidth = this.lineWidth;
    return r;
}

mainRenderer = {
    enabled : true,
    render : function(ctx){
        ctx.fillStyle = "#666";
        for(var x = 0; x < main.size.x; x += 50){
            for(var y = 0; y < main.size.y; y += 50){
                ctx.fillRect(x,y,1,1);
            }
        }
        diagram.render(ctx);
    }
}

connectionRenderer = {
    enabled : true,
    render : function(ctx){
        diagram.renderConnections(ctx);
    }
}

selecter = {
    enabled : true,
    render : function(ctx){
        if(!diagram.selection.length) return;
        ctx.strokeStyle = colors.selection;
        ctx.lineWidth = 2;
        for(var i = 0 ; i < diagram.selection.length; i += 1){
            var obj = diagram.selection[i];
            obj.renderSelection(ctx);
            if(!connectionCreator.drawing)
                obj.renderConnectors(ctx);
        }
    },
    mouseAction : function(action, e){
        if (action == "down"){
            var obj = diagram.findObject(input.mouse.pos);
            diagram.selection = obj ? [obj] : [];
        }
    },
    keyAction : function(action, e){}
}

connectionCreator = {
    enabled : true,
    drawing : false,
    from : null,
    curPos : {x:0,y:0},
    
    render : function(ctx){
        if(!this.drawing) return;

        diagram.renderConnectors(ctx);

        var from = this.from.getPos();
        ctx.strokeStyle = "#eaa";
        ctx.fillStyle = "#fee";

        ctx.arrow([from, this.curPos], 10, 1);
        ctx.stroke();
    },

    findConnector : function(pos, only_selection){
        var objs = diagram.objects;
        if(only_selection)
            objs = diagram.selection;
        for(var i = 0 ; i < objs.length; i += 1){
            var obj = objs[i],
                cons = obj.getConnectors();
            for(var j = 0; j < cons.length; j += 1){
                var con = cons[j];
                if(con.inside(pos))
                    return con;
            }
        }
        return null;
    },

    mouseAction : function(action, e){
        if(action == "down"){           
            this.from = this.findConnector(input.mouse.pos, true);
            if(!this.from)
                return;

            this.drawing = true;
            main.hudManager.exclusiveHud = this;
        }
            
        if(!this.drawing) return;
        
        this.curPos.x = input.mouse.pos.x;
        this.curPos.y = input.mouse.pos.y;

        if(action == "up"){
            this.drawing = false;
            main.hudManager.exclusiveHud = null;

            var to = this.findConnector(this.curPos, false);

            if ( (!to) || (this.from == to) || (this.from.owner == to.owner))
                return;

            var conn = new Connection(this.from, to);
            diagram.objects.push(conn);
            diagram.selection = [conn];
        }
    },
    keyAction : function(action, e){}
}

rectangleMover = {
    enabled : true,
    mouseDown : false,
    lastPos : {x:0,y:0},
    dragging : false,
    render : function(ctx){},
    mouseAction : function(action, e){
        if(!this.dragging){
            this.dragging = action == "down";
            if(this.dragging){
                this.dragging = diagram.selection.length > 0;
                if(!this.dragging) return;
                if(input.keys.control){
                    var objs = [];
                    for(var i = 0; i < diagram.selection.length; i += 1){
                        var obj = diagram.selection[i].clone();
                        objs.push(obj);
                        diagram.objects.push(obj);
                    }
                    diagram.selection = objs;
                }
                main.hudManager.exclusiveHud = this;
                this.lastPos.x = input.mouse.pos.x;
                this.lastPos.y = input.mouse.pos.y;
            }
        } else {
            if (action == "up" ){
                this.dragging = false;
                main.hudManager.exclusiveHud = null;
            }
            if(!this.dragging) return;

            var dx = this.lastPos.x - input.mouse.pos.x,
                dy = this.lastPos.y - input.mouse.pos.y;

            for(var i = 0; i < diagram.selection.length; i += 1){
                var obj = diagram.selection[i];
                if(obj instanceof Rectangle){
                    obj.pos.x -= dx;
                    obj.pos.y -= dy;
                }
            }

            this.lastPos.x = input.mouse.pos.x;
            this.lastPos.y = input.mouse.pos.y;
        }
    },
    keyAction : function(action, e){}
}

rectangleCreator = {
    enabled : true,
    mouseDown : false,
    startPos : {x:0,y:0},
    curPos : {x:0,y:0},
    getRectSize : function(from, to){
        var width = ((to.x - from.x)/50|0)*50,
            height = ((to.y - from.y)/50|0)*50;
        return {x:width, y:height};
    },
    render : function(ctx){
        if(!this.mouseDown) return;
        ctx.fillStyle = "#fee";
        var size = this.getRectSize(this.startPos, this.curPos);
        ctx.fillRect(this.startPos.x, this.startPos.y, size.x, size.y);
    },
    mouseAction : function(action, e){
        if(action == "down"){
            this.mouseDown = true;
            main.hudManager.exclusiveHud = this;
        }

        if(!this.mouseDown) return;

        this.curPos.x = input.mouse.pos.x;
        this.curPos.y = input.mouse.pos.y;
        
        if(action == "down"){
            this.startPos.x = this.curPos.x;
            this.startPos.y = this.curPos.y;
        } else if(action == "up"){
            this.mouseDown = false;
            main.hudManager.exclusiveHud = null;
            var size = this.getRectSize(this.startPos, this.curPos);
            if((size.x > 0) && (size.y > 0)){
                var rect = new Rectangle(this.startPos, size);
                diagram.objects.push(rect);
                diagram.selection = [rect];
            }
        }
    },
    keyAction : function(action, e){}
}

styleMenu = {
    enabled : true,
    pos : {x:0,y:0},
    size : {x:0,y:0},
    PAD : 10,
    mouseDown : false,
    render : function(ctx){
        if(!diagram.selection.length) return;
        
        this.pos.x = main.size.x-70;
        this.pos.y = 0;
        this.size.x = 70;
        this.size.y = main.size.y;

        var r = {pos:{x:this.pos.x + this.PAD, y: this.pos.y + this.PAD}, 
                 size:{x:this.size.x - 2*this.PAD, y: 50}};

        ctx.fillStyle = "#eff4d8";
        ctx.strokeStyle = "#4c7a31";
        ctx.lineWidth = 0.1;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        
        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(this.pos.x, this.pos.y+ this.size.y);
        ctx.stroke();

        for(var i = 0; i < diagram.styles.length; i += 1){
            var sty = diagram.styles[i];
            sty.render(ctx, r);
            r.pos.y += r.size.y + this.PAD;
        }
    },
    inside : Rectangle.prototype.inside,
    mouseAction : function(action, e){
        if(!diagram.selection.length) return;
        
        if(action == "down")
            this.mouseDown = this.inside(input.mouse.pos);
                
        if(!this.mouseDown)
            return;
        
        main.hudManager.exclusiveHud = this;
        
        if(action == "up"){
            this.mouseDown = false;
            main.hudManager.exclusiveHud = null;
            
            var i = ((input.mouse.pos.y-this.PAD-this.pos.y)/(50 + this.PAD))| 0;
            if( (i >= 0) && (i < diagram.styles.length) ){
                diagram.styles[i].assign(diagram.selection)
            }
        }

        return true;
    },
    keyAction : function(action, e){}
}

controlMenu = {
    enabled : true,
    pos : {x:0,y:0},
    size : {x:0,y:0},
    PAD : 10,
    controls : [],
    init : function(){
        this.controls = ["C", "S", "D"];
    },
    render : function(ctx){
        this.pos.x = 0;
        this.pos.y = 0;
        this.size.x = 70;
        this.size.y = main.size.y;

        var r = {pos:{x:this.pos.x + this.PAD, y: this.pos.y + this.PAD}, 
                 size:{x:this.size.x - 2*this.PAD, y: 50}};

        ctx.fillStyle = "#eff4d8";
        ctx.strokeStyle = "#4c7a31";
        ctx.lineWidth = 0.1;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        
        ctx.beginPath();
        ctx.moveTo(this.pos.x + this.size.x, this.pos.y);
        ctx.lineTo(this.pos.x + this.size.x, this.pos.y + this.size.y);
        ctx.stroke();

        for(var i = 0; i < this.controls.length; i += 1){
            var caption = this.controls[i];
            ctx.fillStyle = "#EEEEEC";  
            ctx.strokeStyle = "#BABDB6";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(r.pos.x, r.pos.y, r.size.x, r.size.y);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#555753";
            ctx.font = "25px Georgia";
            ctx.fillText(caption, r.pos.x + r.size.x/3, r.pos.y + r.size.y*2/3);
            r.pos.y += r.size.y + this.PAD; 
        }
    },
    inside : Rectangle.prototype.inside,
    mouseActionX : function(action, e){
        if(!diagram.selection.length) return;
        
        if(action == "down")
            this.mouseDown = this.inside(input.mouse.pos);
                
        if(!this.mouseDown)
            return;
        
        main.hudManager.exclusiveHud = this;
        
        if(action == "up"){
            this.mouseDown = false;
            main.hudManager.exclusiveHud = null;
            
            var i = ((input.mouse.pos.y-this.PAD-this.pos.y)/(50 + this.PAD))| 0;
            if( (i >= 0) && (i < diagram.styles.length) ){
                diagram.styles[i].assign(diagram.selection)
            }
        }
        return true;
    },
    keyAction : function(action, e){}
}


objectDeleter = {
    enabled : true,
    render : function(ctx){},
    keyAction : function(action, e){
        if(!diagram.selection.length) return;
        
        if(action == "up" && (e.keyCode == 46)){ // delete
            var sel = diagram.selection;
            diagram.selection = [];
            for(var i = 0; i < sel.length; i += 1){
                var idx = diagram.objects.indexOf(sel[i]);
                diagram.objects.splice(idx,1);
            }

            var objs = diagram.objects.slice(0);
            for(var i = 0; i < objs.length; i += 1){
                var obj = objs[i];
                if(!(obj instanceof Connection))
                    continue;
                if(sel[0] == obj.from.owner){
                    var idx = diagram.objects.indexOf(obj);
                    diagram.objects.splice(idx,1);
                }
            }
        }
        return true;
    }
}

objectOrderer = {
    enabled : true,
    render : function(ctx){},
    keyAction : function(action, e){
        if(!diagram.selection.length) return;
        if(action == "up"){
            var sel = diagram.selection;
            if((e.keyCode == 33) || (e.keyIdentifier == "PageUp")){
                for(var i = 0; i < sel.length; i += 1){
                    var obj = sel[i],
                        idx = diagram.objects.indexOf(obj);
                    diagram.objects.splice(idx, 1);
                    diagram.objects.splice(idx+1, 0, obj);
                }
            };
            if((e.keyCode == 34) || (e.keyIdentifier == "PageDown")){
                for(var i = 0; i < sel.length; i += 1){
                    var obj = sel[i],
                        idx = diagram.objects.indexOf(obj);
                    diagram.objects.splice(idx, 1);
                    diagram.objects.splice(idx-1, 0, obj);
                }
            };
        }
        return true;
    }
}

controlMenu.init();

main.hudManager.huds.push(
    mainRenderer,
    styleMenu,
    selecter,
    connectionRenderer,
    connectionCreator,
    rectangleMover,
    rectangleCreator,
    objectDeleter,
    objectOrderer
);

input.mouse.render = function(){
    ctx.beginPath();
    ctx.fillStyle = this.down ? "#fdb" : "#adb";
    ctx.arc(this.pos.x, this.pos.y, 3, 0, tau, 0);
    ctx.fill();
}

input.mouse.set = function(action, e){
    this.pos.x = e.pageX - canvas.offsetLeft;
    this.pos.y = e.pageY - canvas.offsetTop;
}

input.keys.set = function(action, e){
    if((e.keyIdentifier == "Control")||(e.keyCode == 17)){
        this.control = action == "down";
    }
    if((e.keyIdentifier == "Shift")||(e.keyCode == 16)){
        this.shift = action == "down";
    }
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){ window.setTimeout(callback, 1000 / 60);};
})();

function modified(){
    window.requestAnimFrame(render);
}

function render(){
    main.render();
    //input.mouse.render();
}
setInterval(modified,500);
render();

mouseBinding = function(action){
    return function(e){
        if(action == "down"){
            input.mouse.down = true
        } else if (action == "up"){
            input.mouse.down = false;
            modified();
        }

        input.mouse.set(action,e);
        main.mouseAction(action, e);
        e.preventDefault();
        if(input.mouse.down)
            modified();
    }
};

canvas.onmousemove=mouseBinding("move");
canvas.onmousedown=mouseBinding("down");
canvas.onmouseup=mouseBinding("up");
canvas.onmousewheel=mouseBinding("wheel");


keyBinding = function(action){
    return function(e){
        modified();

        input.keys.set(action, e);
        main.keyAction(action, e);
    }
};

document.onkeydown=keyBinding("down");
document.onkeypress=keyBinding("press");
document.onkeyup=keyBinding("up");

touchBinding = function(action){
    return function(e){
        var touch = null;
        if(e.touches.length == 1){
            touch = e.touches[0];
            input.mouse.set(action,touch);
        }
        main.mouseAction(action, touch);
        e.preventDefault();
        modified();
    }
};

canvas.addEventListener("touchstart", touchBinding("down"));
canvas.addEventListener("touchend", touchBinding("up"));
canvas.addEventListener("touchcancel", touchBinding("up"));
canvas.addEventListener("touchmove", touchBinding("move"));
