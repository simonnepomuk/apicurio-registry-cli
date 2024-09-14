import {
  getArtifactVersion,
  getLatestArtifact,
} from "../../../generated/client";
import { writeFileSync } from "fs";
import { ArgumentsCamelCase, CommandModule } from "yargs";
import { ensureDirectoryExistence } from "../../utils";
import { parseArtifactInfo } from "./util";

type DownloadArtifactCommandArgs = {
  artifactTag: string;
  output?: string;
  overwrite: boolean;
  registry: string;
};

export const {
  command,
  describe,
  handler,
  builder,
}: CommandModule<{ registry: string }, DownloadArtifactCommandArgs> = {
  command: "artifact download <artifactTag>",
  describe:
    "Download artifact. Usage example: artifact download <groupId>/<artifactId>[:version]",
  builder: (yargs) => {
    return yargs
      .positional("artifactTag", {
        describe: "Artifact Tag. Example: com.example/my-artifact:1.0.0",
        type: "string",
        demandOption: true,
      })
      .option("output", {
        alias: "o",
        describe: "Output file path.",
        type: "string",
        demandOption: false,
      })
      .option("overwrite", {
        alias: "w",
        describe: "Overwrite existing files",
        type: "boolean",
        default: false,
      });
  },
  handler: handleDownloadCommand,
};

async function handleDownloadCommand(
  argv: ArgumentsCamelCase<DownloadArtifactCommandArgs>,
) {
  console.log(`Downloading artifact: ${argv.artifactTag}`);
  const { groupId, artifactId, version } = parseArtifactInfo(
    argv.artifactTag as string,
  );

  const path = { groupId, artifactId };

  const { error, data } = version
    ? await getArtifactVersion({ path: { ...path, version } })
    : await getLatestArtifact({ path });

  if (error) {
    console.error(error);
    process.exit(1);
  }

  if (argv.output) {
    console.log(`Writing artifact to file: ${argv.output}`);
    ensureDirectoryExistence(argv.output);
    writeFileSync(argv.output, JSON.stringify(data, null, 2), {
      flag: argv.overwrite ? "w" : "wx",
    });
  } else {
    console.log("Artifact content: \n");
    console.log(JSON.stringify(data, null, 2));
  }
}
