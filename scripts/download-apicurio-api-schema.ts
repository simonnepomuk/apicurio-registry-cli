#! /usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "fs";

const url =
  "https://raw.githubusercontent.com/Apicurio/apicurio-registry/2.6.x/common/src/main/resources/META-INF/openapi.json";
const tempFolder = "tmp";

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    if (!existsSync(tempFolder)) {
      mkdirSync(tempFolder);
    }
    writeFileSync(`${tempFolder}/openapi.json`, JSON.stringify(data, null, 2));
  });
