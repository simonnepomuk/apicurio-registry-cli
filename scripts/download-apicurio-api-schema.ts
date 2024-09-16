import {writeFileSync} from "node:fs";

import {ensureDirectoryExistence} from "../src/utils/fs.js";

const url =
    "https://raw.githubusercontent.com/Apicurio/apicurio-registry/2.6.x/common/src/main/resources/META-INF/openapi.json";
const tempFolder = "tmp";

const response = await fetch(url);
const api = await response.json();
const filepath = `${tempFolder}/openapi.json`;

ensureDirectoryExistence(filepath);
writeFileSync(filepath, JSON.stringify(api, null, 2));
