var pagesJson = [
    {
        "id": "01_hof",
        "img": {
            "src": "01_hof.jpg",
            "type": "img"
        },
        "is_panorama": false, //TODO 06.04.2022 fix img src and enable panorama
        "clickables": [
            {
                "title": "Zum Eingang",
                "x": "45",
                "y": "75",
                "goto": "15_eingang",
                "icon": "arrow_l"
            },
            {
                "title": "Zur Sporthalle",
                "x": "90",
                "y": "80",
                "goto": "05_sporthalle",
                "icon": "arrow_r"
            }
        ]
    },
    {
        "id": "05_sporthalle",
        "img": {
            "src": "05_sporthalle.jpg",
            "type": "img"
        },
        "is_panorama": false,
        "clickables": [
            {
                "title": "Zum Hof",
                "x": "10",
                "y": "50",
                "goto": "01_hof",
                "icon": "arrow_l"
            }
        ]
    },
    {
        "id": "15_eingang",
        "img": {
            "src": "15_eingang.jpg",
            "type": "img"
        },
        "is_panorama": false,
        "clickables": [
            {
                "title": "Zum Hof",
                "x": "70",
                "y": "45",
                "goto": "01_hof",
                "icon": "arrow_u"
            },
            {
                "title": "Zum Flur",
                "x": "10",
                "y": "30",
                "goto": "15_flur_eg",
                "icon": "arrow_l"
            }
        ]
    },
    {
        "id": "15_flur_eg",
        "img": {
            "src": "15_flur_eg.jpg",
            "type": "img"
        },
        "is_panorama": false, //TODO 06.04.2022 fix img src and enable panorama
        "clickables": [
            {
                "title": "Zum Sekretariat",
                "x": "30",
                "y": "57",
                "goto": "16_sekretariat",
                "icon": "arrow_u"
            },
            {
                "title": "Zum Eingang",
                "x": "80",
                "y": "50",
                "goto": "15_eingang",
                "icon": "arrow_u"
            },
            {
                "title": "Zum Foyer",
                "x": "58",
                "y": "45",
                "goto": "20_foyer",
                "icon": "arrow_u"
            },
            {
                "title": "Zum Glaskasten",
                "x": "11.5",
                "y": "45",
                "goto": "15_glaskasten",
                "icon": "arrow_u"
            }
        ]
    },
    {
        "id": "15_glaskasten",
        "img": {
            "src": "15_glaskasten.jpg",
            "type": "img"
        },
        "is_panorama": false,
        "clickables": [
            {
                "title": "Zurück",
                "x": "50",
                "y": "85",
                "goto": "15_flur_eg",
                "icon": "arrow_d"
            }
        ]
    },
    {
        "id": "16_sekretariat",
        "img": {
            "src": "16_sekretariat.jpg",
            "type": "img"
        },
        "is_panorama": false,
        "clickables": [
            {
                "title": "Zurück",
                "x": "10",
                "y": "10",
                "goto": "15_flur_eg",
                "icon": "arrow_l"
            }
        ]
    },
    {
        "id": "20_foyer",
        "img": {
            "src": "20_foyer.jpg",
            "type": "img"
        },
        "is_360": true,
        "initial_direction": 90,
        "clickables": [
            {
                "title": "in das 1.OG",
                "x": "5",
                "y": "30",
                "goto": "20_treppe_eg",
                "icon": "arrow_u"
            },
            {
                "title": "In den Flur",
                "x": "28",
                "y": "50",
                "goto": "15_flur_eg",
                "icon": "arrow_u"
            },
            {
                "title": "Zum lehrerzimmer",
                "x": "90",
                "y": "50",
                "goto": "25_lehrerzimmer",
                "icon": "arrow_u"
            }
        ]
    },
    {
        "id": "20_treppe_eg",
        "img": {
            "src": "20_treppe_eg.jpg",
            "type": "img"
        },
        "is_panorama": false,
        "clickables": [
            {
                "title": "in das 1.OG",
                "x": "50",
                "y": "50",
                "goto": "20_1stock_foyer",
                "icon": "arrow_u"
            }
        ]
    },
    {
        "id": "25_lehrerzimmer",
        "img": {
            "src": "25_lehrerzimmer.jpg",
            "type": "img"
        },
        "is_panorama": false,
        "clickables": [
            {
                "title": "zum foyer",
                "x": "50",
                "y": "50",
                "goto": "20_foyer",
                "icon": "arrow_r"
            }
        ]
    },
    {
        "id": "20_1stock_foyer",
        "img": {
            "src": "20_1stock_foyer.jpg",
            "type": "img"
        },
        "is_360": true,
        "clickables": [
            {
                "title": "Zum foyer",
                "x": "50",
                "y": "50",
                "goto": "30_flur",
                "icon": "arrow_u"
            },
            {
                "title": "Nach unten",
                "x": "68",
                "y": "50",
                "goto": "20_foyer",
                "icon": "arrow_d"
            }
        ]
    },
    {
        "id": "30_flur",
        "img": {
            "src": "30_aula_foyer_flur.jpg",
            "type": "img"
        },
        "is_panorama": false,
        "clickables": [
            {
                "title": "Aula Vorraum",
                "x": "50",
                "y": "50",
                "goto": "30_aula_foyer",
                "icon": "arrow_u"
            }
        ]
    },
    {
        "id": "30_aula_foyer",
        "img": {
            "src": "vor der Aula.jpg",
            "type": "img"
        },
        "is_360": true,
        "clickables": [
            {
                "title": "1.stock Foyer",
                "x": "23",
                "y": "45",
                "goto": "20_1stock_foyer",
                "icon": "arrow_l"
            }
        ]
    }
]