export function assignNewMetadata(
  metadata: Record<string, string | string[] | Record<string, string>[]>,
  key: string | object,
  value?: string | undefined
) {
  if (typeof key === 'object') {
    Object.assign(metadata, key);
    return metadata;
  }

  return { ...metadata, [key]: value ? value : '' };
}

export function parseMetadata(rawMetadata: string, key: string | undefined) {
  const metadata = JSON.parse(rawMetadata);
  return key ? metadata && metadata[key] : metadata;
}
