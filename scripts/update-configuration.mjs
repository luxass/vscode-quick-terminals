import pkg from "../package.json" assert { type: "json" };
import {} from "node:fs";

const {
  configuration
} = pkg.contributes;



console.log(configuration);
