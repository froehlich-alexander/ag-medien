import {configureStore} from "@reduxjs/toolkit";
import mediaPreviewReducer from "./store/mediaPreview";

const store = configureStore({
    reducer: {
        mediaPreview: mediaPreviewReducer,
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
