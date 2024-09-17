export type ParsedArtifactTag = {
    artifactId: string;
    groupId: string;
    version: null | string;
};

export function parseArtifactInfo(artifactString: string): ParsedArtifactTag {
    const regex = /^([^/]+)\/([^:]+)(?::(.+))?$/;
    const match = artifactString.match(regex);

    if (!match) {
        throw new Error(
            "Invalid artifact tag. Format: <groupId>/<artifactId>[:version]",
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, groupId, artifactId, version] = match;

    return {artifactId: artifactId as string, groupId: groupId as string, version: version || null};
}