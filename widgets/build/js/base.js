class Pair {
    constructor(key, value) {
        this.first = key;
        this.second = value;
    }
}
class Tripel {
    constructor(first, second, third) {
        this.first = first;
        this.second = second;
        this.third = third;
    }
}
class Mixin {
}
class MixinImplementing {
    mixinConstructor(...mixins) {
        let mixinObjs = [];
        for (let type of mixins) {
            mixinObjs.push(new type());
        }
        createMixinFields(this, ...mixinObjs);
        for (let type of mixins) {
            if (type.prototype.hasOwnProperty("_constructor")) {
                type.prototype._constructor.call(this);
            }
        }
    }
}
function createMixinFields(self, ...mixins) {
    for (let mixin of mixins) {
        for (let field of Object.keys(mixin)) {
            Object.defineProperty(self, field, Object.getOwnPropertyDescriptor(mixin, field));
            self[field] = mixin[field];
        }
    }
}
function applyMixins(derivedCtor, constructors) {
    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            if (name == "constructor" || name == "_constructor") {
            }
            else {
                Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
                    Object.create(null));
            }
        });
    });
}
function mixin(...mixins) {
    return function (constructor) {
        applyMixins(constructor, [MixinImplementing, ...mixins]);
    };
}
function toObject(input) {
    if (input instanceof Map) {
        return Object.fromEntries(input);
    }
    else {
        return input;
    }
}
export { Pair, Tripel, Mixin, MixinImplementing, mixin, toObject };
