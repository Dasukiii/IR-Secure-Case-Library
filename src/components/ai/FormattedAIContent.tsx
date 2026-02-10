import { useMemo } from 'react';

interface FormattedAIContentProps {
    content: string;
}

const MALAYSIAN_LAW_LINKS: Record<string, string> = {
    'Employment Act 1955': 'https://www.mp.gov.my/en/corporate/act-and-regulations',
    'Industrial Relations Act 1967': 'https://www.mp.gov.my/en/corporate/act-and-regulations',
    'Trade Unions Act 1959': 'https://www.mp.gov.my/en/corporate/act-and-regulations',
    'Occupational Safety and Health Act 1994': 'https://www.dosh.gov.my/index.php/legislation/acts',
    'Personal Data Protection Act 2010': 'https://www.pdp.gov.my/jpdp_v2/acts-regulations/',
    'Minimum Wages Order': 'https://www.mohr.gov.my/',
    'OSHA 1994': 'https://www.dosh.gov.my/index.php/legislation/acts',
};

function linkMalaysianLaws(text: string): string {
    let result = text;
    Object.entries(MALAYSIAN_LAW_LINKS).forEach(([law, url]) => {
        const regex = new RegExp(`(${law})`, 'gi');
        result = result.replace(regex, `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:text-sky-800 underline">$1</a>`);
    });
    return result;
}

function parseMarkdownBold(text: string): string {
    return text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
}

export function FormattedAIContent({ content }: FormattedAIContentProps) {
    const formattedContent = useMemo(() => {
        let processed = content;
        processed = parseMarkdownBold(processed);
        processed = linkMalaysianLaws(processed);
        processed = processed.replace(/\n/g, '<br />');
        return processed;
    }, [content]);

    return (
        <div
            className="text-sm text-slate-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
    );
}
