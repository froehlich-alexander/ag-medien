let pages = [{
    "id": "01_hof",
    "img": "01_hof.jpg",
    "is_panorama": false,
    "clickables": [{
        "title": "Zum Eingang",
        "x": "70",
        "y": "45",
        "goto": "15_eingang",
        "icon": "arrow_r"
    }, {"title": "Zur Sporthalle", "x": "90", "y": "80", "goto": "05_sporthalle", "icon": "arrow_r"}]
}, {
    "id": "05_sporthalle",
    "img": "05_sporthalle.jpg",
    "is_panorama": false,
    "clickables": [{"title": "Zum Hof", "x": "10", "y": "50", "goto": "01_hof", "icon": "arrow_l"}]
}, {
    "id": "15_eingang",
    "img": "15_eingang.jpg",
    "is_panorama": false,
    "clickables": [{
        "title": "Zum Hof",
        "x": "70",
        "y": "45",
        "goto": "01_hof",
        "icon": "arrow_u"
    }, {"title": "Zum Flur", "x": "10", "y": "30", "goto": "15_flur_eg", "icon": "arrow_l"}]
}, {
    "id": "15_flur_eg",
    "img": "15_flur_eg.jpg",
    "is_panorama": false,
    "clickables": [{
        "title": "Zum Sekretariat",
        "x": "35",
        "y": "60",
        "goto": "16_sekretariat",
        "icon": "arrow_l"
    }, {"title": "Zum Eingang", "x": "60", "y": "50", "goto": "15_eingang", "icon": "arrow_r"}, {
        "title": "Zum Foyer",
        "x": "50",
        "y": "35",
        "goto": "20_foyer",
        "icon": "arrow_u"
    }, {"title": "Zum Glaskasten", "x": "50", "y": "85", "goto": "15_glaskasten", "icon": "arrow_d"}]
}, {
    "id": "15_glaskasten",
    "img": "15_glaskasten.jpg",
    "is_panorama": false,
    "clickables": [{"title": "Zurück", "x": "50", "y": "85", "goto": "15_flur_eg", "icon": "arrow_d"}]
}, {
    "id": "16_sekretariat",
    "img": "16_sekretariat.jpg",
    "is_panorama": false,
    "clickables": [{"title": "Zurück", "x": "10", "y": "10", "goto": "15_flur_eg", "icon": "arrow_l"}]
}, {
    "id": "20_foyer",
    "img": "20_foyer.jpg",
    "is_panorama": true,
    "clickables": [{
        "title": "in das 1.OG",
        "x": "5",
        "y": "30",
        "goto": "20_treppe_eg",
        "icon": "arrow_u"
    }, {
        "title": "In den Flur",
        "x": "28",
        "y": "50",
        "goto": "15_flur_eg",
        "icon": "arrow_u"
    }, {"title": "Zum lehrerzimmer", "x": "90", "y": "50", "goto": "25_lehrerzimmer", "icon": "arrow_u"}]
}, {
    "id": "20_treppe_eg",
    "img": "20_treppe_eg.jpg",
    "is_panorama": false,
    "clickables": [{"title": "in das 1.OG", "x": "50", "y": "50", "goto": "20_1stock_foyer", "icon": "arrow_u"}]
}, {
    "id": "25_lehrerzimmer",
    "img": "25_lehrerzimmer.JPG",
    "is_panorama": false,
    "clickables": [{"title": "zum foyer", "x": "50", "y": "50", "goto": "20_foyer", "icon": "arrow_r"}]
}, {
    "id": "20_1stock_foyer",
    "img": "20_1stock_foyer.jpg",
    "is_panorama": true,
    "clickables": [{"title": "zum foyer", "x": "50", "y": "50", "goto": "20_foyer", "icon": "arrow_r"}]
}]