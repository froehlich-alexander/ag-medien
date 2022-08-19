import i18next from "i18next";
import I18NextChainedBackend from "i18next-chained-backend";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import I18NextHttpBackend from "i18next-http-backend";
import I18NextLocalStorageBackend from "i18next-localstorage-backend";
import {initReactI18next, CustomTypeOptions} from "react-i18next";

i18next
    .use(I18NextChainedBackend)
    .use(I18nextBrowserLanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'de',
        supportedLngs: ['de', 'en'],
        ns: ['translation', 'dialog', 'mainPage', 'tourTypes'] as Array<keyof CustomTypeOptions['resources']>,
        lng: 'en',

        backend: {
            backends: [
                // I18NextLocalStorageBackend,
                I18NextHttpBackend,
            ],
            backendOptions: [
                // {
                //     prefix: "i18next_res_",
                //     defaultVersion: 'v0.1,',
                //     expirationTime: 7*24*60*60*1000,
                //     versions: {
                //         de: 'v0.1',
                //         en: 'v0.1',
                //     }
                // } as I18NextLocalStorageBackend["options"],
                {
                    loadPath: "locales/{{lng}}/{{ns}}.json",
                    crossDomain: false,
                } as I18NextHttpBackend["options"]
            ],
        },
        react: {

        }
    });

export default i18next;
