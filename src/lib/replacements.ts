import { hashString } from './utils';

// Name pools for consistent replacements
const FIRST_NAMES = [
    'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Taylor', 'Quinn', 'Avery',
    'Cameron', 'Dakota', 'Skyler', 'Reese', 'Parker', 'Finley', 'Rowan', 'Sage'
];

const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin'
];

export interface ReplacementMap {
    names: Map<string, string>;
    emails: Map<string, string>;
    ips: Map<string, string>;
}

export function createReplacementMap(): ReplacementMap {
    return {
        names: new Map(),
        emails: new Map(),
        ips: new Map()
    };
}

// Get a consistent fake name for a given real name
export function getReplacementName(originalName: string, map: ReplacementMap): string {
    const normalizedName = originalName.trim().toLowerCase();

    if (map.names.has(normalizedName)) {
        return map.names.get(normalizedName)!;
    }

    const hash = hashString(normalizedName);
    const firstName = FIRST_NAMES[hash % FIRST_NAMES.length];

    // Check if original has multiple parts (first + last name)
    const parts = originalName.trim().split(/\s+/);
    let replacement: string;

    if (parts.length > 1) {
        const lastNameHash = hashString(normalizedName + '_last');
        const lastName = LAST_NAMES[lastNameHash % LAST_NAMES.length];
        replacement = `${firstName} ${lastName}`;
    } else {
        replacement = firstName;
    }

    map.names.set(normalizedName, replacement);
    return replacement;
}

// Get a consistent fake email for a given real email
export function getReplacementEmail(originalEmail: string, map: ReplacementMap): string {
    const normalizedEmail = originalEmail.trim().toLowerCase();

    if (map.emails.has(normalizedEmail)) {
        return map.emails.get(normalizedEmail)!;
    }

    const hash = hashString(normalizedEmail);
    const replacement = `user${hash % 10000}@example.com`;

    map.emails.set(normalizedEmail, replacement);
    return replacement;
}

// Get a consistent fake IP for a given real IP
export function getReplacementIPv4(originalIp: string, map: ReplacementMap): string {
    const normalizedIp = originalIp.trim();

    if (map.ips.has(normalizedIp)) {
        return map.ips.get(normalizedIp)!;
    }

    const hash = hashString(normalizedIp);
    const replacement = `10.0.${(hash % 256)}.${((hash >> 8) % 256)}`;

    map.ips.set(normalizedIp, replacement);
    return replacement;
}

// Get a consistent fake IPv6 for a given real IPv6
export function getReplacementIPv6(originalIp: string, map: ReplacementMap): string {
    const normalizedIp = originalIp.trim().toLowerCase();

    if (map.ips.has(normalizedIp)) {
        return map.ips.get(normalizedIp)!;
    }

    const hash = hashString(normalizedIp);
    // Use a link-local address format
    const replacement = `fe80::${(hash % 0xffff).toString(16)}:${((hash >> 16) % 0xffff).toString(16)}:0:0`;

    map.ips.set(normalizedIp, replacement);
    return replacement;
}
