#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { commands } from "./cmds";
import { client } from "../generated/client";
import { authMiddleware } from "./auth/auth";

yargs(hideBin(process.argv))
  .option("registry", {
    alias: "r",
    describe: "Registry URL",
    type: "string",
    demandOption: true,
  })
  .option("auth-url", {
    alias: "a",
    describe: "Auth Server URL",
    type: "string",
    demandOption: false,
    implies: ["client-id"],
  })
  .option("client-id", {
    alias: "c",
    describe: "Auth Client ID",
    type: "string",
    demandOption: false,
  })
  .option("client-secret", {
    alias: "s",
    describe: "Auth Client Secret",
    type: "string",
    demandOption: false,
  })
  .option("scope", {
    alias: "o",
    describe: "Auth Scope",
    type: "string",
    demandOption: false,
  })
  .command(commands)
  .middleware(setRegistryUrlMiddleware)
  .middleware(authMiddleware)
  .demandCommand()
  .env("APICURIO")
  .completion()
  .parse();

function setRegistryUrlMiddleware(argv: { registry: string }) {
  client.setConfig({
    baseUrl: `${argv.registry}/apis/registry/v2`,
  });
}
