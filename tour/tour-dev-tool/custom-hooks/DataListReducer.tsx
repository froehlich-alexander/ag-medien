import React, {useCallback, useReducer} from "react";
import {arrayIsValid, UnFlatArray} from "../utils";


function useDataList<DataItem extends { equals(other: DataItem): boolean }, DataItemKey>
// DataItemList extends Readonly<Array<DataItem>> = Array<DataItem>,
// DataItemKeyList extends Readonly<Array<DataItemKey>> = Array<DataItemKey>>
(
    initialValue: Array<DataItem>,
    getKey: (item: DataItem | DataItemKey) => DataItemKey,
    // should return whether the two items have the same key (and one will be replaced by the other) (NOT whether they are equal)
    compareItems: (item1: DataItem, item2: DataItem) => boolean = (item1, item2) => (getKey(item1) === getKey(item2)),
    onItemsAdded?: (items: Array<DataItem>) => void,
    onItemsUpdated?: (items: Array<DataItem>) => void,
    onItemsRemoved?: (items: Array<DataItem>) => void,
): [Array<DataItem>, {
    add: (...items: UnFlatArray<DataItem>) => void,
    update: (...items: UnFlatArray<DataItem>) => void,
    remove: (...items: UnFlatArray<DataItem | DataItemKey>) => void,
    reset: (...items: UnFlatArray<DataItem>) => void,
    replace: (...items: Array<[DataItemKey, DataItem]>) => void,
}] {
    type DataItemList = Array<DataItem>;
    type DataItemKeyList = Array<DataItemKey>;

    const reducer = useCallback((state: DataItemList, action:
        { type: "add" | "update", items: DataItemList }
        | { type: "remove", items: DataItemList | DataItemKeyList }
        | { type: "reset", items?: DataItemList }
        | { type: "replace", items: Array<[DataItemKey, DataItem]> },
    ): DataItemList => {
        switch (action.type) {
            case "reset":
                const media = action.items;
                if (!arrayIsValid(media)) {
                    if (!state.length) {
                        return state;
                    }
                    onItemsRemoved?.(state);
                    return [];
                } else {
                    onItemsRemoved?.(state.filter(value => !media.some(value1 => compareItems(value, value1))));
                    const addedItems = media.filter(value => !state.some(value1 => compareItems(value, value1)));
                    onItemsAdded?.(addedItems);
                    onItemsUpdated?.(media.filter(value => !addedItems.includes(value)));

                    return media;
                }
            case "remove":
                if (!action.items.length || !state.length) {
                    return state;
                }
                const newState = [];
                const removedItems = [];
                const mediaKeys = action.items.map(getKey);
                for (let i of state) {
                    if (mediaKeys.includes(getKey(i))) {
                        removedItems.push(i);
                    } else {
                        newState.push(i);
                    }
                }
                onItemsRemoved?.(removedItems);
                return newState;
            // return Object.entries(state).filter(([k]) => !action.removeMedia.includes(k))
            //     .reduce((previousValue, [key, value]) =>
            //             Object.defineProperty(previousValue, key, {value: value}),
            //         {} as Mutable<MediaFilesType>) as MediaFilesType;
            case "add":
            case "update":
                if (action.items.length === 0) {
                    return state;
                }
                const itemsToDelete: number[] = [];
                const itemsToUpdate: DataItemList = [];
                const itemToAdd: DataItemList = [];

                for (let item of action.items) {
                    const oldIndex = state.findIndex(value => compareItems(item, value));
                    if (oldIndex === -1) {
                        itemToAdd.push(item);
                    } else if (!item.equals(state[oldIndex])) {
                        itemsToUpdate.push(item);
                        itemsToDelete.push(oldIndex);
                    }
                }

                // if we change anything
                if (itemToAdd.length || itemsToUpdate.length) {
                    const res = state.slice();
                    // .filter(v => !itemsToDelete.includes(v));
                    let i = 0;
                    for (let index of itemsToDelete) {
                        res[index] = itemsToUpdate[i];
                        i++;
                    }
                    res.push(...itemToAdd);
                    onItemsAdded?.(itemToAdd);
                    onItemsUpdated?.(itemsToUpdate);
                    return res;
                } else {
                    return state;
                }
            case "replace":
                let edited = false;
                const res = state.slice();
                for (let [key, item] of action.items) {
                    const index = state.findIndex(value => getKey(value) === key);
                    if (index >= 0) {
                        res[index] = item;
                        edited = true;
                    }
                }
                if (edited) {
                    return res;
                } else {
                    return state;
                }
        }
    }, [onItemsAdded, onItemsUpdated, onItemsRemoved]);
    const [dataList, dispatch] = useReducer(reducer, initialValue);


    const add = useCallback((...items: UnFlatArray<DataItem>) => {
        dispatch({type: "add", items: items.flat(1) as DataItemList});
    }, []);

    const update = useCallback((...items: UnFlatArray<DataItem>) => {
        dispatch({type: "update", items: items.flat(1) as DataItemList});
    }, []);

    const remove = useCallback((...items: UnFlatArray<DataItem | DataItemKey>) => {
        dispatch({type: "remove", items: items.flat() as DataItemList | DataItemKeyList});
    }, []);

    const reset = useCallback((...items: UnFlatArray<DataItem>) => {
        dispatch({type: "reset", items: items.flat() as DataItemList});
    }, []);

    const replace = useCallback((...items: Array<[DataItemKey, DataItem]>) => {
        dispatch({type: "replace", items: items});
    }, []);

    return [
        dataList,
        {
            add: add,
            update: update,
            remove: remove,
            reset: reset,
            replace: replace,
        },
    ];
}

export default useDataList;
