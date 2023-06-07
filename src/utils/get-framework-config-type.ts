import { Framework, FrameworkConfigType } from "../types";
import fs from "fs-extra";

export async function getFrameworkConfigType(
  framework: Framework
): Promise<FrameworkConfigType> {
  if (framework === "next") {
    let config: FrameworkConfigType = "NEXT_PAGES_DIR";
    await fs.readdir(".", (err, files) => {
      files.some((file) => {
        if (file.includes("/src/")) {
          config = "NEXT_SRC_DIR";
          return true;
        }

        if (file.includes("/app/")) {
          config = "NEXT_APP_DIR";
          return true;
        }
      });
    });
    return config;
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
