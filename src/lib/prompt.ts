/**
 * Fields required to build a clipboard-ready educational prompt.
 * Matches the bacteria content schema subset used by Copy Prompt.
 */
export interface BacteriaPromptEntry {
	commonName: string;
	scientificName: string;
	description: string;
	traits: {
		shape: string;
		habitat: string;
		famousFor: string;
	};
	usefulFor: string[];
	disclaimer?: string;
}

const DEFAULT_PROMPT_DISCLAIMER =
	'Educational and prompt use only. Not for culturing, isolation, weaponization, or home-lab recipes.';

/**
 * Pure function: builds a grounded, guardrailed prompt string from an entry.
 * Refuses wet-lab / weaponization help; includes "I'm using this for: ___".
 */
export function buildCopyPrompt(entry: BacteriaPromptEntry): string {
	const usefulFor =
		entry.usefulFor.length > 0
			? entry.usefulFor.map((item) => `- ${item}`).join('\n')
			: '- General study and plain-language writing about this organism';

	const disclaimer = entry.disclaimer?.trim() || DEFAULT_PROMPT_DISCLAIMER;

	return [
		'You are helping me learn and write about a bacterium using only the grounded science pack below.',
		'',
		'## Identity',
		`- Common name: ${entry.commonName}`,
		`- Scientific name: ${entry.scientificName}`,
		`- Description: ${entry.description}`,
		'',
		'## Traits',
		`- Shape: ${entry.traits.shape}`,
		`- Habitat: ${entry.traits.habitat}`,
		`- Famous for: ${entry.traits.famousFor}`,
		'',
		'## Useful for studying / writing about',
		usefulFor,
		'',
		'## Rules (must follow)',
		'- Do not invent facts beyond this pack. If something is unknown or uncertain, say so.',
		'- Refuse any request involving culturing, isolation, enrichment, growth media, weaponization, bioweapons, “grow this at home,” or other wet-lab / dangerous instructions.',
		'- Help only with study planning, explainers, summaries, and writing — never lab protocols or how-to guidance for handling live organisms.',
		`- Disclaimer: ${disclaimer}`,
		'',
		"I'm using this for: ___",
		'',
		'Please help with study planning or a plain-language writeup based only on this pack.',
	].join('\n');
}
