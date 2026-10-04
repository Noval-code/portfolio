import type { SchemaTypeDefinition } from "sanity";

import certificate from "./certificate";
import post from "./post";
import project from "./project";

export const schemaTypes: SchemaTypeDefinition[] = [
  post,
  project,
  certificate,
];
