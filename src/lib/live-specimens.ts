/** Browse cards that render a live 3D colony instead of the SVG still. */
const LIVE_SPECIMEN_SLUGS = new Set([
	'escherichia-coli',
	'staphylococcus-epidermidis',
	'helicobacter-pylori',
	'streptomyces-coelicolor',
]);

export function isLiveSpecimen(slug: string): boolean {
	return LIVE_SPECIMEN_SLUGS.has(slug);
}
