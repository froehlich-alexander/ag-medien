import {PageData} from "../Data";

function renameAddressableId(oldId: string, newId: string, pages: readonly PageData[]) {
    const updated: [string, PageData][] = [];

    for (let page of pages) {
        const pageId = page.id;
        let edited = false;
        if (page.id === oldId) {
            page = page.withId(newId);
            edited = true;
        }

        const newInlineObjects = [];
        let changedInlineObjects = false;
        for (let o of page.inlineObjects) {
            if (o.isClickable() && o.goto === oldId) {
                o = o.withGoto(newId);
                changedInlineObjects = true;
            }
            // inline Objects like text fields can have an id
            if ("id" in o) {
                if (o.id === oldId) {
                    o = o.withId(newId);
                }
                changedInlineObjects = true;
            }

            newInlineObjects.push(o);
        }
        if (changedInlineObjects) {
            page = page.withInlineObjects(newInlineObjects);
            edited = true;
        }

        if (edited) {
            updated.push([pageId, page]);
        }
    }
    return updated;
}

/**
 * Returns a list containing all ids of addressable inline objects (an addressable inline object is a page or a text field, etc.; and it must define an id field)
 * @param pages
 */
function getAddressableIds(pages:readonly PageData[]): string[] {
    const res: string[] = [];
    for (let page of pages) {
        res.push(page.id);
        for (let object of page.inlineObjects) {
            if (object.isAddressable()) {
                res.push(object.id);
            }
        }
    }
    return res;
}

export {renameAddressableId, getAddressableIds};
