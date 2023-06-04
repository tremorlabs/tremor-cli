import { Framework, FrameworkConfigType } from "../types";
import fs from "fs-extra";

export async function getFrameworkConfigType(
  framework: Framework
): Promise<FrameworkConfigType> {
  if (framework === "next") {
    await fs.readdir(".", (err, files) => {
      files.forEach((file) => {
        if (file.includes("/src/")) {
          return "NEXT_SRC_DIR";
        }

        if (file.includes("/app/")) {
          return "NEXT_APP_DIR";
        }

        return "NEXT_PAGES_DIR";
      });
    });
  }

  if (framework == "vite") {
    return "VITE";
  }

  if (framework == "redwood") {
    return "REDWOOD";
  }

  if (framework == "cra") {
    return "CRA";
  }

  if (framework == "other") {
    return "CRA";
  }

  return "NEXT_APP_DIR";
}
