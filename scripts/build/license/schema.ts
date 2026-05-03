// Bump `version` whenever the manifest gains/changes fields in a backward-incompatible way.
import { z } from 'zod';

export const LicenseStatusSchema = z.enum(['approved', 'pending', 'rejected']);

const FilenameSchema = z
  .string()
  .min(1)
  .refine(
    (s) => !s.includes('/') && !s.includes('\\') && !s.includes('..'),
    'filename must be a bare basename',
  );

const Sha256OrTbd = z.union([
  z.literal('TBD'),
  z.string().regex(/^[a-f0-9]{64}$/i, 'sha256 must be 64 hex chars'),
]);

export const LicenseEntrySchema = z
  .object({
    filename: FilenameSchema,
    license: z.string().min(1),
    status: LicenseStatusSchema,
    sha256: Sha256OrTbd,
    attribution: z.string().min(1),
  })
  .strict();

export const LicenseManifestSchema = z
  .object({
    version: z.literal(1),
    sources: z.array(LicenseEntrySchema).min(1),
  })
  .strict()
  .superRefine((manifest, ctx) => {
    const seen = new Map<string, number>();
    manifest.sources.forEach((entry, index) => {
      const prev = seen.get(entry.filename);
      if (prev !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['sources', index, 'filename'],
          message: `duplicate filename '${entry.filename}' (first seen at index ${prev})`,
        });
      } else {
        seen.set(entry.filename, index);
      }
    });
  });

export type LicenseStatus = z.infer<typeof LicenseStatusSchema>;
export type LicenseEntry = z.infer<typeof LicenseEntrySchema>;
export type LicenseManifest = z.infer<typeof LicenseManifestSchema>;
