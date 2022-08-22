const TSJ = require("ts-to-json");
const fs = require("fs");

const outPutPath = "./tour/pages-json-schema.json"
const config = {
    path: "./tour/types.d.ts",
    tsconfig: "./tour/tsconfig.json",
    jsDoc: "extended",
    type: "JsonSchulTourConfigFile",
}

const schema = TSJ.createGenerator(config).createSchema(config.type);
const schemaString = JSON.stringify(schema, null, 2);
fs.writeFile(outPutPath, schemaString, (err) => {
    if (err) throw err;
});
