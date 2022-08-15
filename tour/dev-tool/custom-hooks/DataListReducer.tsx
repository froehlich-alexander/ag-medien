import bootstrap from "bootstrap";
import React, {useCallback, useReducer} from "react";
import {arrayIsValid, UnFlatArray} from "../utils";


function useDataList<DataItem extends { equals(other: DataItem): boolean }, DataItemKey>
// DataItemList extends Readonly<Array<DataItem>> = Array<DataItem>,
// DataItemKeyList extends Readonly<Array<DataItemKey>> = Array<DataItemKey>>
(
    initialValue: Array<DataItem>,
    getKey: (item: DataItem | DataItemKey) => DataItemKey,
    compareItems: (item1: DataItem, item2: DataItem) => boolean = (item1, item2) => (getKey(item1) === getKey(item2)),
    onItemsAdded?: (items: Array<DataItem>) => void,
    onItemsUpdated?: (items: Array<DataItem>) => void,
    onItemsRemoved?: (items: Array<DataItem>) => void,
): [Array<DataItem>, {
    add: (...items: UnFlatArray<DataItem>) => void,
    update: (...items: UnFlatArray<DataItem>) => void,
    remove: (...items: UnFlatArray<DataItem | DataItemKey>) => void,
    reset: (...items: UnFlatArray<DataItem>) => void,
}] {
    type DataItemList = Array<DataItem>;
    type DataItemKeyList = Array<DataItemKey>;

    const reducer = useCallback((state: DataItemList, action:
        { type: 'add' | 'update', media: DataItemList }
        | { type: 'remove', media: DataItemList | DataItemKeyList }
        | { type: 'reset', media?: DataItemList },
    ): DataItemList => {
        switch (action.type) {
            case "reset":
                const media = action.media;
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
                if (!action.media.length || !state.length) {
                    return state;
                }
                const newState = [];
                const removedItems = [];
                const mediaKeys = action.media.map(getKey);
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
                if (action.media.length === 0) {
                    return state;
                }
                const itemsToDelete: DataItemList = [];
                const filesToUpdate: DataItemList = [];
                const filesToAdd: DataItemList = [];

                for (let item of action.media) {
                    const old = state.find(value => compareItems(item, value));
                    if (old === undefined) {
                        filesToAdd.push(item);
                    } else if (!item.equals(old)) {
                        filesToUpdate.push(item);
                        itemsToDelete.push(old);
                    }
                }

                // if we change anything
                if (filesToAdd.length || filesToUpdate.length) {
                    const res = state.filter(v => !itemsToDelete.includes(v));
                    res.push(...filesToAdd, ...filesToUpdate);
                    onItemsAdded?.(filesToAdd);
                    onItemsUpdated?.(filesToUpdate);
                    return res;
                } else {
                    return state;
                }
        }
    }, [onItemsAdded, onItemsUpdated, onItemsRemoved]);
    const [dataList, dispatch] = useReducer(reducer, initialValue);


    const add = useCallback((...items: UnFlatArray<DataItem>) => {
        dispatch({type: 'add', media: items.flat(1) as DataItemList});
    }, []);

    const update = useCallback((...items: UnFlatArray<DataItem>) => {
        dispatch({type: 'update', media: items.flat(1) as DataItemList});
    }, []);

    const remove = useCallback((...items: UnFlatArray<DataItem | DataItemKey>) => {
        dispatch({type: 'remove', media: items.flat() as DataItemList | DataItemKeyList});
    }, []);

    const reset = useCallback((...items: UnFlatArray<DataItem>) => {
        dispatch({type: 'reset', media: items.flat() as DataItemList});
    }, []);

    return [
        dataList,
        {
            add: add,
            update: update,
            remove: remove,
            reset: reset,
        },
    ];
}

export default useDataList;
