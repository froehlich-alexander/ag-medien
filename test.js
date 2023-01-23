
// class A {
//     static  a = [1, 2];
//     static {
//         Object.freeze(this);
//         Object.freeze(this.a);
//     }
//     static {
//         // console.log('static A');
//     }
// }
//
// class B extends A {
//
//     static {
//         // console.log(this.a);
//         // this.a.push(3);
//     }
//     static {
//         // console.log(this.a);
//         // console.log('static B');
//     }
// }
//
// class C extends B {
//     static a;
//
//     static {
//         console.log(Object.isFrozen(C));
//         console.log(Object.entries(this));
//
//
//         Object.defineProperty(C, 'a', {
//             value: [5, 7],
//             writable: false,
//             configurable: false,
//             enumerable: true,
//         })
//         console.log(this.prototype.constructor['a']);
//         console.log(this.a === A.a);
//     }
// }
//
function makeFrozen(constr) {
    class New extends constr {
        static {
            Object.freeze(constr);
        }
    }
}

class AA {
    static makeImmutable() {
        Object.freeze(this);
        Object.freeze(this.prototype);
    }
}

class BB extends AA {
    static {
        console.log(Object.isFrozen(this));
    }
    static a= 3
    static {
        this.makeImmutable();
    }
    static b = 0;
}
