#!/usr/bin/env node
import path from "path";
import fs from "fs-extra";
import { type PackageJson } from "type-fest";
import { Command } from "commander";
import { logger } from "./utils/logger";
import prompts from "prompts";
import ora from "ora";
import { execa } from "execa";
import { getTailwindConfig } from "./utils/get-tailwind-config";
import { getFrameworkConfigType } from "./utils/get-framework-config-type";
import { getPackageManager } from "./utils/get-package-manager";

export function getPackageInfo() {
  const packageJsonPath = path.join("package.json");

  return fs.readJSONSync(packageJsonPath) as PackageJson;
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

async function main() {
  const packageInfo = await getPackageInfo();
  const packageManager = getPackageManager();

  const program = new Command()
    .name("Tremor CLI")
    .description(
      packageInfo.description ?? "Configures Tremor in your project."
    )
    .version(
      packageInfo.version || "1.0.0",
      "-v, --version",
      "display the version number"
    );

  program
    .command("init")
    .description("Configures Tremor in your project.")
    .option("-y, --yes", "Skip confirmation prompt.")
    .action(async (options) => {
      logger.warn("This command assumes a React project with Tailwind CSS.");
      logger.warn(
        "If you don't have these, follow the manual steps at https://www.tremor.so/docs/getting-started/installation"
      );
      logger.warn("");

      // Promt framework type.
      const { framework } = await prompts({
        type: "select",
        name: "framework",
        message: "Which framework are you using?",
        choices: [
          { title: "Next", value: "next" },
          { title: "Vite", value: "vite" },
          { title: "Refine", value: "refine" },
          { title: "Redwood", value: "redwood" },
          { title: "Create React App", value: "cra" },
          { title: "Other", value: "other" },
        ],
      });

      // Infer the type of the framework configuration
      const frameworkConfigType = getFrameworkConfigType(framework);

      if (!options.yes) {
        const { proceed } = await prompts({
          type: "confirm",
          name: "proceed",
          message:
            "Running this command will install dependencies and overwrite existing tailwind configurations. Proceed?",
          initial: true,
        });

        if (!proceed) {
          process.exit(0);
        }
      }

      // Install tremor
      const tremorSpinner = ora(`Installing @tremor/react...`).start();
      await execa(packageManager, [
        packageManager === "npm" ? "install" : "add",
        "@tremor/react",
      ]);
      tremorSpinner.succeed();

      const dependenciesSpinner = ora(
        `Installing Tailwind CSS dependency...`
      ).start();
      await execa(packageManager, [
        packageManager === "npm" ? "install" : "add",
        "-D @tailwindcss/forms",
      ]);
      dependenciesSpinner.succeed();

      // Check the kind of project (TypeScript/JavaScript)
      const isTypeScriptProject = fs.existsSync("tsconfig.json");

      // Infer the name of the tailwind config file accordingly
      const tailwindConfigFileName = isTypeScriptProject ? "tailwind.config.ts" : "tailwind.config.js";
      const tailwindDestination = `./${tailwindConfigFileName}`;

      // Check if the tailwind config file already exists
      const tailwindConfigFileExists = fs.existsSync(tailwindDestination);

      // If the tailwind config file already exists, prompt the user to overwrite it
      // if (tailwindConfigFileExists) {
      //   const { overwrite } = await prompts({
      //     type: "confirm",
      //     name: "overwrite",
      //     message: `A ${tailwindConfigFileName} already exists. Overwrite it?`,
      //     initial: false,
      //   });

      //   if (!overwrite) {
      //     process.exit(0);
      //   }
      // }

      // Write the tailwind config file
      const tailwindSpinner = ora(`Configuring ${tailwindConfigFileName}...`).start();
      await fs.writeFile(
        tailwindDestination,
        getTailwindConfig(frameworkConfigType),
        "utf8"
      );
      tailwindSpinner.succeed();
    });

  program.parse();
}

main();
