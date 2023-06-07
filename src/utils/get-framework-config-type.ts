import { Framework, FrameworkConfigType } from "../types";
import fs from "fs-extra";

export function getFrameworkConfigType(
  framework: Framework
): FrameworkConfigType {
  if (framework === "next") {
    const filenames = fs.readdirSync(".");
    for (const filename of filenames) {
      if (filename.includes("src")) {
        return "NEXT_SRC_DIR";
      }

      if (filename.includes("app")) {
        return "NEXT_APP_DIR";
      }
    }
    return "NEXT_PAGES_DIR";
  }

  if (framework === "vite") {
    return "VITE";
  }

  if (framework === "redwood") {
    return "REDWOOD";
  }

  if (framework === "cra") {
    return "CRA";
  }

  if (framework === "other") {
    return "CRA";
  }

  return "NEXT_APP_DIR";
}
