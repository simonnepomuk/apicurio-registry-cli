export function parseArtifactInfo(artifactString: string) {
  const regex = /^([^/]+)\/([^:]+)(?::(.+))?$/;
  const match = artifactString.match(regex);

  if (!match) {
    throw new Error(
      "Invalid artifact tag. Format: <groupId>/<artifactId>[:version]",
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, groupId, artifactId, version] = match;

  return { groupId, artifactId, version: version || null };
}
