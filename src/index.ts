import { readFileSync, writeFileSync } from 'node:fs';

import {
  idSchema,
  MetadataObject,
  metadataObjectSchema,
  RequestDetails,
  requestDetailsSchema,
} from './schema';
import { Artifact } from './artifact';
import { assignNewMetadata, parseMetadata } from './lib';

export type { RequestDetails };

export default class MetadataController {
  private readonly requestDefaults: RequestDetails;
  private readonly id: string;

  private readonly artifactController: Artifact;

  private readonly fileName = 'metadata.json';

  constructor(uniqueID: string, settings: RequestDetails) {
    const verifiedID = idSchema.parse(uniqueID);
    this.id = `${verifiedID}-metadata`;

    this.artifactController = new Artifact();

    this.requestDefaults = requestDetailsSchema.parse(settings);
  }

  async getMetadata(issue: number): Promise<MetadataObject | undefined>;
  async getMetadata(
    issue: number,
    key: string
  ): Promise<MetadataObject | undefined>;
  async getMetadata(
    issue: number,
    key?: string
  ): Promise<MetadataObject | undefined> {
    const artifactName = `${this.id}-${issue}`;

    const artifact = await this.artifactController.getByName(artifactName);

    if (!artifact) return;

    console.log(
      `Downloading artifact: ${artifactName}: ${JSON.stringify(artifact)}`
    );

    const { downloadPath } = await this.artifactController.download(
      artifact.id
    );

    console.log(`Downloaded artifact to: ${downloadPath}`);

    if (!downloadPath) return;

    const metadataRaw = readFileSync(
      `${process.cwd}/${this.fileName}`
    ).toString();

    return parseMetadata(metadataRaw, key);
  }

  async setMetadata(issue: number, key: object): Promise<MetadataObject>;
  async setMetadata(
    issue: number,
    key: string,
    value: string
  ): Promise<MetadataObject>;
  async setMetadata(
    issue: number,
    key: string | object,
    value?: string
  ): Promise<MetadataObject> {
    const artifactName = `${this.id}-${issue}`;
    let oldMetadata: MetadataObject = {};
    let newMetadata: MetadataObject = {};

    const artifact = await this.artifactController.getByName(artifactName);

    if (artifact) {
      const { downloadPath } = await this.artifactController.download(
        artifact.id
      );

      const metadataRaw = readFileSync(
        `${downloadPath}/${this.fileName}`
      ).toString();

      const oldMetadata = metadataObjectSchema.parse(metadataRaw);
    }

    newMetadata = assignNewMetadata(oldMetadata, key, value);

    if (JSON.stringify(oldMetadata) === JSON.stringify(newMetadata)) {
      return newMetadata;
    }

    if (artifact) {
      await this.artifactController.remove(artifactName);
    }

    console.log(`Creating artifact: ${artifactName}`);
    writeFileSync(
      `${process.cwd()}/${this.fileName}`,
      JSON.stringify(newMetadata)
    );

    console.log('pwd', process.cwd());

    await this.artifactController.upload(artifactName, [
      `${process.cwd()}/${this.fileName}`,
    ]);

    return newMetadata;
  }
}
