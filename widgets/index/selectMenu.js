

let items = [];
for (let i = 0; i < 100; i++) {
    items[i] = new SelectMenuItem()
        .setSelected(false)
        .setLabel("TEST")
        .setValue("Hello")
        .setCheckbox(true)
        .setIcon(new Icon().set("edit", IconType.material));
}

let selectMenu = new SelectMenu()
    .setTitle("Hello")
    .setItems(items)
    .enableButtons(true);
selectMenu.build().appendTo("body");
selectMenu.show();