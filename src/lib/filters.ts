/**
 * Browse filter helpers.
 * Categories mirror the design rail: shape + tag buckets.
 */

export type BrowseCategoryId =
	| 'all'
	| 'rod'
	| 'spherical'
	| 'spiral'
	| 'extreme'
	| 'human-related'
	| 'biotech';

export interface BrowseCategory {
	id: BrowseCategoryId;
	label: string;
}

export const BROWSE_CATEGORIES: BrowseCategory[] = [
	{ id: 'all', label: 'All' },
	{ id: 'rod', label: 'Rod-shaped' },
	{ id: 'spherical', label: 'Spherical' },
	{ id: 'spiral', label: 'Spiral' },
	{ id: 'extreme', label: 'Extreme environments' },
	{ id: 'human-related', label: 'Human-related' },
	{ id: 'biotech', label: 'Useful in biotech' },
];

/** Short labels for tag chips on cards (rail uses longer category labels). */
const TAG_CHIP_LABELS: Record<string, string> = {
	extreme: 'Extreme',
	'human-related': 'Human-related',
	biotech: 'Biotech',
};

export interface FilterableEntry {
	commonName: string;
	scientificName: string;
	shape: string;
	tags: string[];
}

export interface BrowseFilterOptions {
	category?: BrowseCategoryId | string;
	query?: string;
}

/** True when `value` is a known browse category id. */
export function isBrowseCategoryId(value: string): value is BrowseCategoryId {
	return BROWSE_CATEGORIES.some((c) => c.id === value);
}

/** Coerce an unknown string (e.g. URL/search param) to a valid category id. */
export function parseBrowseCategory(value: string | null | undefined): BrowseCategoryId {
	if (value && isBrowseCategoryId(value)) return value;
	return 'all';
}

/** Returns true if the entry matches the category rail selection. */
export function matchesCategory(entry: FilterableEntry, category: BrowseCategoryId): boolean {
	if (category === 'all') return true;
	if (category === 'rod' || category === 'spherical' || category === 'spiral') {
		return entry.shape === category;
	}
	if (category === 'extreme') return entry.tags.includes('extreme');
	if (category === 'human-related') return entry.tags.includes('human-related');
	if (category === 'biotech') return entry.tags.includes('biotech');
	return true;
}

/** Case-insensitive match against common or scientific name. */
export function matchesSearch(entry: FilterableEntry, query: string): boolean {
	const q = query.trim().toLowerCase();
	if (!q) return true;
	return (
		entry.commonName.toLowerCase().includes(q) ||
		entry.scientificName.toLowerCase().includes(q)
	);
}

/** True when the entry matches both category and search query. */
export function matchesFilters(entry: FilterableEntry, options: BrowseFilterOptions = {}): boolean {
	const category = parseBrowseCategory(options.category);
	const query = options.query ?? '';
	return matchesCategory(entry, category) && matchesSearch(entry, query);
}

/** Filter a list of entries by category and/or name search. */
export function filterEntries<T extends FilterableEntry>(
	entries: readonly T[],
	options: BrowseFilterOptions = {},
): T[] {
	return entries.filter((entry) => matchesFilters(entry, options));
}

/** Display label for a tag chip; falls back to the raw tag string. */
export function tagLabel(tag: string): string {
	return TAG_CHIP_LABELS[tag] ?? tag;
}
