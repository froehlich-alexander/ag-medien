import {Widget, WidgetEvents} from "./Widget.js";

const SettingsEvents = {
    ...WidgetEvents,
}
type SettingsEvents = (typeof SettingsEvents[keyof typeof SettingsEvents]);

class Settings extends Widget<SettingsEvents> {
    
}