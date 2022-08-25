import {useCallback, useMemo, useState} from "react";

export default function useSet<T>(initial: Set<T> = new Set()): [Set<T>, {
    toggle: (value: T, toggle?: boolean) => void,
    add: (value: T) => void,
    remove: (value: T) => void,
    has: (value: T) => boolean,
    reset: (values: T[])=>void,
}] {
    const [set, setSet] = useState<Set<T>>(initial);

    const toggle = useCallback((value: T, toggle?: boolean) => {
        const newSet = new Set<T>(set);
        console.log("set state", value, toggle, set, newSet);
        if (toggle === undefined) {
            if (set.has(value)) {
                newSet.delete(value);
            } else {
                newSet.add(value);
            }
        } else if (set.has(value) !== toggle) {
            if (toggle) {
                newSet.add(value);
            } else {
                newSet.delete(value);
            }
        } else {
            return;
        }
        setSet(newSet);
    }, [set]);

    const add = useCallback((value: T) => {
        toggle(value, true);
    }, [toggle]);


    const remove = useCallback((value: T) => {
        toggle(value, false);
    }, [toggle]);


    const has = useMemo(() => (value: T) => {
        return set.has(value);
    }, [set]);
    
    const reset = useCallback((values:T[]) => {
        setSet(new Set(values));
    }, []);

    return [
        set,
        {
            toggle,
            add,
            remove,
            has,
            reset,
        },
    ];
};
