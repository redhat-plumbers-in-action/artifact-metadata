import { DefaultArtifactClient } from '@actions/artifact';

export class Artifact {
  private client: DefaultArtifactClient;

  constructor() {
    this.client = new DefaultArtifactClient();
  }

  async getByName(name: string) {
    const artifacts = await this.list();
    return artifacts.find(artifact => artifact.name === name);
  }

  async upload(name: string, files: string[]) {
    await this.client.uploadArtifact(name, files, process.cwd());
  }

  async list() {
    return (await this.client.listArtifacts()).artifacts;
  }

  async download(id: number) {
    return await this.client.downloadArtifact(id);
  }

  async remove(name: string) {
    await this.client.deleteArtifact(name);
  }
}
