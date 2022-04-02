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
Mixin.__mixinDependencies = [];
class MixinImplementing extends Mixin {
    mixinConstructor(...mixins) {
        mixins = this.constructor.__mixinDependencies;
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
function orderMixins(mixins = []) {
    let orderedMixins = [MixinImplementing];
    for (let mixin of mixins.filter(value => value !== MixinImplementing)) {
        orderedMixins.push(...orderMixins(mixin.__mixinDependencies));
        orderedMixins.push(mixin);
    }
    return orderedMixins.filter((value, index) => orderedMixins.indexOf(value) === index);
}
function mixin(...mixins) {
    mixins = orderMixins(mixins);
    console.log(mixins);
    return function (constructor) {
        if (!(constructor instanceof Mixin)) {
            applyMixins(constructor, [...mixins]);
        }
        Object.defineProperty(constructor, "__mixinDependencies", {
            configurable: false,
            enumerable: false,
            writable: false,
            value: mixins
        });
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
