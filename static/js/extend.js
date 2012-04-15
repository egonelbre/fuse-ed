Array.prototype.seqOf = function(type, fn){
    var esc;
    for(var i = 0; i < this.length; i += 1){
    	var obj = this[i];
        if((type != null) && !(obj instanceof type))
            continue;
        esc = fn(obj);
        if(esc) return esc;
    }
}

Array.prototype.seqReverseOf = function(type, fn){
    var esc;
    for(var i = this.length - 1; i >= 0; i -= 1){
    	var obj = this[i];
        if((type != null) && !(obj instanceof type))
            continue;
        esc = fn(obj);
        if(esc) return esc;
    }
}

Object.clone = function clone(obj) {
     return Object.extend({}, obj);
};

Object.extend = function extend(what, wit) {
    var extObj, witKeys = Object.keys(wit);
    extObj = Object.keys(what).length ? Object.clone(what) : {};
    witKeys.forEach(function(key) {
        Object.defineProperty(extObj, key, Object.getOwnPropertyDescriptor(wit, key));
    });
    return extObj;
};