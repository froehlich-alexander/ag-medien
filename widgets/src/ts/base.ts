class Pair<T, T1> {
    first: T;
    second: T1;

    constructor(key: T, value: T1) {
        this.first = key;
        this.second = value;
    }
}

class Tripel<T, T1, T2> {
    first: T;
    second: T1;
    third: T2;


    constructor(first: T, second: T1, third: T2) {
        this.first = first;
        this.second = second;
        this.third = third;
    }
}

// type GenericConstructor<T = {}> = new (...args: any[]) => T;

/**
 * If you define a Mixin, you should inherit this class even if this class <b>currently</b> does not have any functionality<br>
 * Classes which inherit {@link Mixin} are kind of abstract so <b> don't use them as normal classes</b> That's not what they are intended to
 */
abstract class Mixin {
    public static __mixinDependencies: typeof Mixin[] = [];
}

/**
 * This class should be implemented by all classes which uses mixins
 */
abstract class MixinImplementing extends Mixin {
    // protected abstract __mixin_dependencies(): typeof Mixin[];

    protected mixinConstructor(...mixins: typeof Mixin[]) {
        mixins = (<typeof Mixin><unknown>this.constructor).__mixinDependencies;
        let mixinObjs = [];
        for (let type of mixins) {
            // @ts-ignore
            mixinObjs.push(new type());
        }
        createMixinFields(this, ...mixinObjs);
        for (let type of mixins) {
            // @ts-ignore
            if (type.prototype.hasOwnProperty("_constructor")) {
                // @ts-ignore
                type.prototype._constructor.call(this);
            }
        }
    }
}

/**
 * This function should be called in the constructor of a class which uses a mixin<br>
 * It copies all <b>normal</b> field<br>
 * It does <b>not</b> copy static fields or functions (except for arrow functions which are some kind of fields)<br>
 * The <b>Type Script</b> access type does not matter <b>but fields starting with "#" will NOT be included</b>
 * @param {typeof Mixin} mixins all mixins which are used
 * @param {T} self the object to add the fields
 */
function createMixinFields<T>(self: T, ...mixins: Mixin[]): void {
    for (let mixin of mixins) {
        for (let field of Object.keys(mixin)) {
            Object.defineProperty(self, field, Object.getOwnPropertyDescriptor(mixin, field)!);
            // @ts-ignore
            self[field] = mixin[field];
        }
    }
}

/**
 * We do <b>NOT</b> include constructors because IDK how this would work
 * @param derivedCtor
 * @param constructors
 */
function applyMixins(derivedCtor: any, constructors: any[]) {
    // let baseConstructors: {} = {};
    // let constructorCount = 0;

    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            if (name == "constructor" || name == "_constructor") {
                /*
                Object.defineProperty(baseConstructors, constructorCount, (Object.getOwnPropertyDescriptor(baseCtor.prototype, name)));
                console.log("cons")
                console.log(baseConstructors[constructorCount])
                constructorCount++;
                 */
            } else {
                Object.defineProperty(
                    derivedCtor.prototype,
                    name,
                    Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
                    Object.create(null)
                );
            }
        });
    });
    /*
    for (let i = 0; i < constructorCount; i++) {
        Object.defineProperty(
            derivedCtor.prototype,
            "constructors" + i,
            Object.getOwnPropertyDescriptor(baseConstructors, i));
    }
     */
}

/**
 * Order mixins so that lower dependencies (super classes) are applied first so that overriding works
 * @param {typeof Mixin} mixins
 * @return {typeof Mixin[]}
 */
function orderMixins(mixins: typeof Mixin[] = []): typeof Mixin[] {
    let orderedMixins: typeof Mixin[] = [MixinImplementing];
    for (let mixin of mixins.filter(value => value !== MixinImplementing)) {
        orderedMixins.push(...orderMixins(mixin.__mixinDependencies));
        orderedMixins.push(mixin);
    }
    return orderedMixins.filter((value, index) => orderedMixins.indexOf(value) === index);
}

/**
 * Use this annotation on every class which implements mixins<br>
 * You still have to use the {@link mixinConstructor} method inside your constructor<br>
 * Example:<br>
 * @mixin(ExampleMixin)<br>
 * class Foo extends Bar {                                  <br>
 *      constructor{                                        <br>
 *         super();                                         <br>
 *         this.{@link mixinConstructor}(ExampleMixin);     <br>
 *     }                                                    <br>
 * }                                                        <br>
 * @param {typeof Mixin} mixins
 * @return {Function}
 */
function mixin(...mixins: typeof Mixin[]): Function {
    // applyMixins(constructor, mixins);
    mixins = orderMixins(mixins);
    console.log(mixins);
    return function (constructor: Function) {
        if (!(constructor instanceof Mixin)) {
            applyMixins(constructor, [...mixins]);
        }
        Object.defineProperty(
            constructor,
            "__mixinDependencies",
            {
                configurable: false,
                enumerable: false,
                writable: false,
                value: mixins
            }
        );
    };
}

/**
 * This converts a object of a type (like a Map) into an object.<br>
 * This can be useful e.g. if you want to convert something to json
 * @param input
 * @return {Object}
 */
function toObject(input: any): Object {
    if (input instanceof Map) {
        return Object.fromEntries(input);
    } else {
        return input;
    }
}

export {Pair, Tripel, Mixin, MixinImplementing, mixin, toObject};