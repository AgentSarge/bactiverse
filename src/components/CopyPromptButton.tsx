import { useId, useState } from 'react';
import {
	buildCopyPrompt,
	buildFactsClipboard,
	type BacteriaPromptEntry,
} from '../lib/prompt';

/** Props for the Copy prompt island — mirrors BacteriaPromptEntry. */
export interface CopyPromptButtonProps extends BacteriaPromptEntry {
	/** Optional button label override. */
	label?: string;
	/** `pill` sits in the Agent panel; `bar` is a segment of the action bar. */
	variant?: 'pill' | 'bar';
}

export default function CopyPromptButton({
	commonName,
	scientificName,
	description,
	traits,
	usefulFor,
	disclaimer,
	label = 'Copy prompt',
	variant = 'pill',
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
		<CopyTextButton
			text={text}
			label={label}
			copiedLabel="Copied!"
			announce="Prompt copied to clipboard"
			variant={variant}
			icon="copy"
		/>
	);
}

export interface CopyFactsButtonProps {
	commonName: string;
	scientificName: string;
	traits: BacteriaPromptEntry['traits'];
	label?: string;
	variant?: 'pill' | 'bar';
}

/** Copies the trait block. Used in the desktop action bar. */
export function CopyFactsButton({
	commonName,
	scientificName,
	traits,
	label = 'Copy facts',
	variant = 'bar',
}: CopyFactsButtonProps) {
	const text = buildFactsClipboard({ commonName, scientificName, traits });

	return (
		<CopyTextButton
			text={text}
			label={label}
			copiedLabel="Copied!"
			announce="Facts copied to clipboard"
			variant={variant}
			icon="facts"
		/>
	);
}

function CopyTextButton({
	text,
	label,
	copiedLabel,
	announce,
	variant,
	icon,
}: {
	text: string;
	label: string;
	copiedLabel: string;
	announce: string;
	variant: 'pill' | 'bar';
	icon: 'copy' | 'facts';
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
		<div className={`copy-prompt${variant === 'bar' ? ' copy-prompt--bar' : ''}`}>
			<button
				type="button"
				className={`copy-prompt__btn${variant === 'bar' ? ' copy-prompt__btn--bar' : ''}${copied ? ' is-copied' : ''}`}
				onClick={handleCopy}
				aria-describedby={statusId}
			>
				{icon === 'facts' ? <FactsIcon /> : <CopyIcon />}
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

function FactsIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M8 7.5h8M8 12h8M8 16.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
			<path
				d="M7 4h7.2L19 8.7V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 19V5.5A1.5 1.5 0 0 1 7.5 4H7Z"
				stroke="currentColor"
				strokeWidth="1.6"
			/>
		</svg>
	);
}
