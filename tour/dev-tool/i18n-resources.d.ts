import 'react-i18next';
import dialogEN from './locales/en/dialog.json';
import translationEN from './locales/en/translation.json';
import mainPageEN from './locales/en/mainPage.json';
import tourTypesEN from './locales/en/tourTypes.json';

import dialogDE from './locales/de/dialog.json';
import translationDE from './locales/de/translation.json';
import mainPageDE from './locales/de/mainPage.json';
import tourTypesDE from './locales/de/tourTypes.json';

declare module 'react-i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation',
        allowObjectInHTMLChildren: true,
        resources: {
            translation: typeof translationEN & typeof translationDE,
            dialog: typeof dialogEN & typeof dialogDE,
            mainPage: typeof mainPageEN & typeof mainPageDE,
            tourTypes: typeof tourTypesEN & typeof tourTypesDE,
        },
    }
}
