import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** Shared educational disclaimer used when an entry omits a custom one. */
export const DEFAULT_DISCLAIMER =
	'Educational and prompt use only. Not for culturing, isolation, weaponization, or home-lab recipes.';

export const bacteriaShapeSchema = z.enum(['rod', 'spherical', 'spiral', 'other']);

export const bacteriaTraitsSchema = z.object({
	shape: z.string(),
	habitat: z.string(),
	famousFor: z.string(),
});

export const bacteriaSourceSchema = z.object({
	title: z.string(),
	url: z.string().url(),
});

/** Zod schema for bacteria Markdown frontmatter. */
export const bacteriaSchema = z.object({
	commonName: z.string(),
	scientificName: z.string(),
	description: z.string(),
	caption: z.string(),
	image: z.string(),
	mediaKind: z.literal('still'),
	shape: bacteriaShapeSchema,
	tags: z.array(z.string()),
	traits: bacteriaTraitsSchema,
	usefulFor: z.array(z.string()),
	sources: z.array(bacteriaSourceSchema),
	disclaimer: z.string().default(DEFAULT_DISCLAIMER),
});

export type BacteriaShape = z.infer<typeof bacteriaShapeSchema>;
export type BacteriaTraits = z.infer<typeof bacteriaTraitsSchema>;
export type BacteriaSource = z.infer<typeof bacteriaSourceSchema>;
export type BacteriaData = z.infer<typeof bacteriaSchema>;

const bacteria = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/bacteria' }),
	schema: bacteriaSchema,
});

export const collections = {
	bacteria,
};
