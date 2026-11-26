import { useId, useState } from 'react';
import { buildCopyPrompt, type BacteriaPromptEntry } from '../lib/prompt';

/** Props for the Copy prompt island — mirrors BacteriaPromptEntry. */
export interface CopyPromptButtonProps extends BacteriaPromptEntry {
	/** Optional button label override. */
	label?: string;
}

export default function CopyPromptButton({
	commonName,
	scientificName,
	description,
	traits,
	usefulFor,
	disclaimer,
	label = 'Copy prompt',
}: CopyPromptButtonProps) {
	const statusId = useId();
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState(false);

	async function handleCopy() {
		const text = buildCopyPrompt({
			commonName,
			scientificName,
			description,
			traits,
			usefulFor,
			disclaimer,
		});

		try {
			await navigator.clipboard.writeText(text);
			setError(false);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
			setError(true);
			window.setTimeout(() => setError(false), 3000);
		}
	}

	const announced = copied
		? 'Prompt copied to clipboard'
		: error
			? 'Copy failed — try again'
			: '';

	return (
		<div className="copy-prompt">
			<button
				type="button"
				className={`copy-prompt__btn${copied ? ' is-copied' : ''}`}
				onClick={handleCopy}
				aria-describedby={statusId}
			>
				{copied ? 'Copied!' : label}
			</button>
			<span id={statusId} className="sr-only" role="status" aria-live="polite">
				{announced}
			</span>
			{error ? (
				<span className="copy-prompt__status copy-prompt__status--error" aria-hidden="true">
					Copy failed — try again
				</span>
			) : null}
		</div>
	);
}
