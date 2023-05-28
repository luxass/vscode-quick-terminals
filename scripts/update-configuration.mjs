// @ts-check

import { readdir } from "node:fs/promises";
import pkg from "../package.json" assert { type: "json" };

const schemasDir = new URL("../configuration-schemas", import.meta.url).pathname;

/** @type {{ name: string, path: string, isTemplate: boolean }[]} */
const schemas = await readdir(schemasDir, { withFileTypes: true })
  .then((dirents) => dirents.filter((dirent) => dirent.isFile() &&
    (dirent.name.includes(".schema.json") || dirent.name.includes(".template.json"))).map((dirent) => ({
    name: dirent.name,
    path: `${schemasDir}/${dirent.name}`,
    isTemplate: dirent.name.includes(".template.json")
  })).sort((a, b) => {
    if (a.name === "global.schema.json") {
      return 1;
    }

    if (b.name === "global.schema.json") {
      return -1;
    }

    if (a.isTemplate && !b.isTemplate) {
      return -1;
    }

    return a.name.localeCompare(b.name);
  }));



/** @type {Map<string, any>} */
const templatesMap = new Map();

/* const templates = schemas.filter((schema) => schema.isTemplate);

// loop over templates based on the usage order
// the usage order can be found by checking their $include property
// if a template has a $include property, it means that it is using another template

for (const template of templates) {
  const templateContent = await import(template.path, {
    assert: { type: "json" }
  }).then((module) => module.default);

  const stringifiedTemplate = JSON.stringify(templateContent);

  // check if the templates has a $include property somewhere with a regex and get the includes name inside the array
  const regex = /"\$include":\s*\[([^\]]+)\]/g;

  const match = regex.exec(stringifiedTemplate);
  if (!match) {
    continue;
  }

  const includes = match[1].split(",").map((value) => value.trim().replace(/"/g, ""));

  for (const include of includes) {
    console.log(include);
  }


} */


console.log(schemas);
for (const schema of schemas) {
  const schemaContent = await import(schema.path, {
    assert: { type: "json" }
  }).then((module) => module.default);

  const properties = schemaContent.properties;

  const propertiesKeys = Object.keys(properties);
  // traverse all properties and replace $include with the actual template
  traverseObject(properties, (key, value) => {
    if (key.includes("$include")) {
      const templateName = value.split(".")[0];
      const template = templatesMap.get(templateName);

      console.log(templateName, template);

      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      console.log(`Including ${templateName} inside ${schema.name}`);


      const templateKeys = Object.keys(template);

      const intersection = templateKeys.filter((value) => propertiesKeys.includes(value));

      if (intersection.length > 0) {
        throw new Error(`Template ${templateName} has keys that are already in the schema: ${intersection.join(", ")}`);
      }

      // add template inside the object that has the $include property


      delete properties.$include;
    }
  });

  if (schema.isTemplate) {
    templatesMap.set(schema.name.split(".")[0], properties);
    continue;
  }

  console.log(JSON.stringify(properties, null, 2));

}

function traverseObject(obj, callback, parentKey = "") {
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key].forEach((value) => {
        const arrayKey = parentKey ? `${parentKey}.${key}` : key;
        callback(arrayKey, value);
      });
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      const nestedKey = parentKey ? `${parentKey}.${key}` : key;
      traverseObject(obj[key], callback, nestedKey);
    } else {
      const keyValue = parentKey ? `${parentKey}.${key}` : key;
      callback(keyValue, obj[key]);
    }
  }
}

const {
  configuration
} = pkg.contributes;


