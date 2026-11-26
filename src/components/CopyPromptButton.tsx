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
	const text = buildCopyPrompt({
		commonName,
		scientificName,
		description,
		traits,
		usefulFor,
		disclaimer,
	});

	return (
		<CopyTextButton text={text} label={label} copiedLabel="Copied!" announce="Prompt copied to clipboard" />
	);
}

function CopyTextButton({
	text,
	label,
	copiedLabel,
	announce,
}: {
	text: string;
	label: string;
	copiedLabel: string;
	announce: string;
}) {
	const statusId = useId();
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState(false);

	async function handleCopy() {
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

	const announced = copied ? announce : error ? 'Copy failed — try again' : '';

	return (
		<div className="copy-prompt">
			<button
				type="button"
				className={`copy-prompt__btn${copied ? ' is-copied' : ''}`}
				onClick={handleCopy}
				aria-describedby={statusId}
			>
				<CopyIcon />
				{copied ? copiedLabel : label}
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

function CopyIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M8 8.5V6.8A1.8 1.8 0 0 1 9.8 5h7.4A1.8 1.8 0 0 1 19 6.8v7.4a1.8 1.8 0 0 1-1.8 1.8H15.5"
				stroke="currentColor"
				strokeWidth="1.7"
			/>
			<path
				d="M6.8 9h7.4A1.8 1.8 0 0 1 16 10.8v7.4A1.8 1.8 0 0 1 14.2 20H6.8A1.8 1.8 0 0 1 5 18.2v-7.4A1.8 1.8 0 0 1 6.8 9Z"
				stroke="currentColor"
				strokeWidth="1.7"
			/>
		</svg>
	);
}

