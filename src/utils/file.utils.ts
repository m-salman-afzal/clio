import path from "node:path";
import {fileURLToPath} from "node:url";

export const currentFilePath = (importMetaUrl: string, filename: string) => {
  return path.join(path.dirname(fileURLToPath(importMetaUrl)), filename);
};
