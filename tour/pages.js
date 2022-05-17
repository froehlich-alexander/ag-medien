var pagesJson = [
    {
        "id": "01_hof",
        "img": {
            // "src": "01_hof.jpg",
            "src": "test.mp4",
            "srcMin": "01_hof.jpg"
        },
        //"is_panorama": true, //TODO 06.04.2022 fix img src and enable panorama
        // "initial_direction": 34,
        "clickables": [
            {
                "title": "Zum Eingang",
                "x": "39.8",
                "y": "80",
                "goto": "15_eingang",
                "icon": "arrow_l"
            },
            {
                "title": "Zur Sporthalle",
                "x": "69",
                "y": "82",
                "goto": "05_sporthalle",
                "icon": "arrow_l"
            }
        ]
    },
    {
        "id": "05_sporthalle",
        "img": {
            "src": "05_sporthalle.jpg"
        },
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
        "is_panorama": true, //TODO 06.04.2022 fix img src and enable panorama
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
            },
            {
                "title": "Zum Beispiel Klassenzimmer",
                "x": "80",
                "y": "50",
                "goto": "klassenraum_s",
                "icon": "arrow_u"
            },
            {
                "title": "Nach ganz oben",
                "x": "61",
                "y": "50",
                "goto": "30_Dachboden",
                "icon": "arrow_u"
            }
        ]
    },
    {
        "id": "30_flur",
        "img": {
            "src": "30_aula_foyer_flur.jpg",
            "type": "img"
        },
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
            "src": "vor_der_aula.jpg",
            "type": "img"
        },
        "is_panorama": true,
        "clickables": [
            {
                "title": "1.stock Foyer",
                "x": "23",
                "y": "45",
                "goto": "20_1stock_foyer",
                "icon": "arrow_l"
            }
        ]
    },
    {
        "id": "klassenraum_s",
        "img": {
            "src": "klassenraum_s.jpg",
            "type": "img"
        },
        "clickables": [
            {
                "title": "zurück zum 1. Stock",
                "x": "50",
                "y": "50",
                "goto": "20_1stock_foyer",
                "icon": "arrow_r"
            }
        ]
    },
    {
        "id": "30_Dachboden",
        "img": {
            "src": "Dachboden.jpg",
            "type": "img"
        },
        "clickables": [
            {
                "title": "nach unten",
                "x": "50",
                "y": "50",
                "goto": "20_1stock_foyer",
                "icon": "arrow_d"
            },
            {
                "title": "weiter nachoben",
                "x": "50",
                "y": "40",
                "goto": "40_Turm",
                "icon": "arrow_u"
            }
        ]
    },
    {
        "id": "40_Turm",
        "img": {
            "src": "turm4.jpg",
            "type": "img"
        },
        "clickables": [
            {
                "title": "unser team",
                "x": "6",
                "y": "50",
                "goto": "60_turm",
                "icon": "arrow_l"
            },
            {
                "title": "zurück zum Dachboden",
                "x": "80",
                "y": "50",
                "goto": "30_Dachboden",
                "icon": "arrow_d"
            }
        ]
    },
    {
        "id": "60_turm",
        "img": {
            "src": "60_turm.jpg",
            "type": "img"
        },
        "clickables": [
            {
                "title": "zurück",
                "x": "80",
                "y": "50",
                "goto": "40_Turm",
                "icon": "arrow_r"
            },
            {
                "title": "weiter am Turm",
                "x": "10",
                "y": "50",
                "goto": "Hof_von_oben",
                "type": "arrow_l"
            }
        ]
    },
    {
        "id": "Hof_von_oben",
        "img": {
            "src": "schulhof_vom_turm.jpg",
            "type": "img"
        },
        "clickables": [
            {
                "title": "zum Ausgangspunkt",
                "x": "6",
                "y": "50",
                "goto": "40_Turm",
                "type": "arrow_l"
            },
            {
                "title": "zum Team",
                "x": "73",
                "y": "50",
                "goto": "60_turm",
                "type": "arrow_r"
            }
        ]
    }

]