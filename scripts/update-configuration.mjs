// @ts-check

import { readdir } from "node:fs/promises";
import pkg from "../package.json" assert { type: "json" };

const schemasDir = new URL("../configuration-schemas", import.meta.url).pathname;

/** @type {{ name: string, path: string}[]} */
const schemas = await readdir(schemasDir, { withFileTypes: true })
  .then((dirents) => dirents.filter((dirent) => dirent.isFile() &&
    dirent.name.includes(".schema.json")).map((dirent) => ({
    name: dirent.name,
    path: `${schemasDir}/${dirent.name}`
  })));



/** @type {Map<string, any>} */
const templates = new Map();

for (const schema of schemas) {
  const schemaContent = await import(schema.path, {
    assert: { type: "json" }
  }).then((module) => module.default);

  if (schemaContent.template) {
    for (const [key, value] of Object.entries(schemaContent.properties)) {
      templates.set(key, value);
    }
    continue;
  }

  const properties = schemaContent.properties;

  if (typeof properties.$include !== "object" && !Array.isArray(properties.$include)) {
    continue;
  }

  console.log(properties);

  // traverse all properties and replace $include with the actual template
  traverse(properties, (key, value) => {
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        console.log("array", value);
      } else {
        console.log("object", value);
      }

    }


  });
}

function traverse(obj, callback) {
  for (const [key, value] of Object.entries(obj)) {
    console.log(key, value);
    if (typeof value === "object") {
      traverse(value, callback);
    } else {
      callback(key, value);
    }
  }
}

const {
  configuration
} = pkg.contributes;


