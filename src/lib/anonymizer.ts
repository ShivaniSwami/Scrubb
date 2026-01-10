import type { ReplacementMap } from './replacements';
import {
    createReplacementMap,
    getReplacementName,
    getReplacementEmail,
    getReplacementIPv4,
    getReplacementIPv6
} from './replacements';


// Regex patterns for PII detection
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const IPV4_REGEX = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
const IPV6_REGEX = /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:|:(?::[0-9a-fA-F]{1,4}){1,7}|\b(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}\b/g;

export interface NerEntity {
    entity: string;
    word: string;
    start: number;
    end: number;
    score: number;
}

export interface AnonymizationResult {
    anonymizedText: string;
    detectedEntities: {
        names: string[];
        emails: string[];
        ips: string[];
    };
    replacementMap: ReplacementMap;
}

// Replace emails in text
function replaceEmails(text: string, map: ReplacementMap): { text: string; found: string[] } {
    const found: string[] = [];
    const result = text.replace(EMAIL_REGEX, (match) => {
        if (!found.includes(match)) {
            found.push(match);
        }
        return getReplacementEmail(match, map);
    });
    return { text: result, found };
}

// Replace IPv4 addresses in text
function replaceIPv4(text: string, map: ReplacementMap): { text: string; found: string[] } {
    const found: string[] = [];
    const result = text.replace(IPV4_REGEX, (match) => {
        // Skip common non-PII IPs like localhost
        if (match === '127.0.0.1' || match === '0.0.0.0') {
            return match;
        }
        if (!found.includes(match)) {
            found.push(match);
        }
        return getReplacementIPv4(match, map);
    });
    return { text: result, found };
}

// Replace IPv6 addresses in text
function replaceIPv6(text: string, map: ReplacementMap): { text: string; found: string[] } {
    const found: string[] = [];
    const result = text.replace(IPV6_REGEX, (match) => {
        // Skip loopback
        if (match === '::1') {
            return match;
        }
        if (!found.includes(match)) {
            found.push(match);
        }
        return getReplacementIPv6(match, map);
    });
    return { text: result, found };
}

// Replace names detected by NER in text
function replaceNames(
    text: string,
    entities: NerEntity[],
    map: ReplacementMap
): { text: string; found: string[] } {
    const found: string[] = [];

    // Filter for person entities
    const personEntities = entities
        .filter(e => e.entity.includes('PER'))
        .sort((a, b) => a.start - b.start);

    // Group consecutive tokens into full names
    const mergedNames: string[] = [];
    let currentName = '';
    let lastEnd = -1;

    for (const entity of personEntities) {
        const word = entity.word.replace(/^##/, ''); // Handle subword tokens

        if (lastEnd === -1) {
            currentName = word;
            lastEnd = entity.end;
        } else if (entity.start <= lastEnd + 2) {
            // Merge adjacent tokens
            if (entity.word.startsWith('##')) {
                currentName += word;
            } else {
                currentName += ' ' + word;
            }
            lastEnd = entity.end;
        } else {
            // Save previous name and start new one
            if (currentName.trim() && currentName.trim().length >= 2) {
                mergedNames.push(currentName.trim());
            }
            currentName = word;
            lastEnd = entity.end;
        }
    }

    // Don't forget the last name
    if (currentName.trim() && currentName.trim().length >= 2) {
        mergedNames.push(currentName.trim());
    }

    // Get unique names, sorted by length descending (replace longer names first)
    const uniqueNames = [...new Set(mergedNames)].sort((a, b) => b.length - a.length);

    let result = text;

    // Replace each name globally in the text
    for (const name of uniqueNames) {
        if (name.length < 2) continue; // Skip single characters

        if (!found.includes(name)) {
            found.push(name);
        }

        const replacement = getReplacementName(name, map);
        // Use global replacement for this name (case-sensitive)
        const regex = new RegExp(escapeRegex(name), 'g');
        result = result.replace(regex, replacement);
    }

    return { text: result, found };
}

// Helper to escape regex special characters
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Main anonymization function
export function anonymizeText(
    text: string,
    nerEntities: NerEntity[] = [],
    existingMap?: ReplacementMap
): AnonymizationResult {
    const map = existingMap || createReplacementMap();

    // Replace in order: Names first (using NER), then emails, then IPs
    const nameResult = replaceNames(text, nerEntities, map);
    const emailResult = replaceEmails(nameResult.text, map);
    const ipv4Result = replaceIPv4(emailResult.text, map);
    const ipv6Result = replaceIPv6(ipv4Result.text, map);

    return {
        anonymizedText: ipv6Result.text,
        detectedEntities: {
            names: nameResult.found,
            emails: emailResult.found,
            ips: [...ipv4Result.found, ...ipv6Result.found]
        },
        replacementMap: map
    };
}

// Check if text looks like JSON
export function isJsonLike(text: string): boolean {
    const trimmed = text.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'));
}

// Format output (pretty print JSON if applicable)
export function formatOutput(text: string, wasJson: boolean): string {
    if (wasJson) {
        try {
            return JSON.stringify(JSON.parse(text), null, 2);
        } catch {
            return text;
        }
    }
    return text;
}
