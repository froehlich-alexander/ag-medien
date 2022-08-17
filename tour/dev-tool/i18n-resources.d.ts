import 'react-i18next';
import dialogEN from './locales/en/dialog.json';
import translationEN from './locales/en/translation.json';
import dialogDE from './locales/de/dialog.json';
import translationDE from './locales/de/translation.json';

declare module 'react-i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation',
        resources: {
            translation: typeof translationEN & typeof translationDE,
            dialog: typeof dialogEN & typeof dialogDE,
        },
    }
}
