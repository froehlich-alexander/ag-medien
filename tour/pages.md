# pages.json - File - Example

```json5
[
  {
    "id": "custom id",
    "img": "bild url (pfad relativ zu /img, bei Bildern in diesem Ordner brauch man also keinen extra Pfad)",
    "is_panorama": true, //false ist der default
    "clickables": [
//      alle 'buttons'
      {
        "title": "in das 1.OG",
        "x": "die x coordinate (von oben) in % (Bsp: 30)",
        "y": "30",
        "goto": "Id des nächsten bildes",
        "icon": "arrow richtung (arrow_u für up etc.)", //arrow_l ist der default
        "backward": false //false ist der default
      },
      {
//        new clickable...
      }
    ]
  },
//  other pages...
]
```