import { z } from 'zod';

export const idSchema = z.string().min(1);

export const requestDetailsSchema = z.object(
  {
    owner: z.string().min(1),
    repo: z.string().min(1),
    headers: z.object({
      authorization: z.string().min(1),
    }),
  },
  {
    required_error: `Required settings wasn't provided: {owner: string, repo: string}`,
  }
);

export type RequestDetails = z.infer<typeof requestDetailsSchema>;

export const metadataObjectSchema = z.record(
  z.union([z.string(), z.array(z.string()), z.array(z.record(z.any()))]),
  {
    required_error: `Metadata doesn't have an expected structure: {key: string, value: string | string[] | object[]}`,
  }
);

export type MetadataObject = z.infer<typeof metadataObjectSchema>;
