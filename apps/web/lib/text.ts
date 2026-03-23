const cp1252ByteMap: Record<number, number> = {
  8364: 0x80,
  8218: 0x82,
  402: 0x83,
  8222: 0x84,
  8230: 0x85,
  8224: 0x86,
  8225: 0x87,
  710: 0x88,
  8240: 0x89,
  352: 0x8a,
  8249: 0x8b,
  338: 0x8c,
  381: 0x8e,
  8216: 0x91,
  8217: 0x92,
  8220: 0x93,
  8221: 0x94,
  8226: 0x95,
  8211: 0x96,
  8212: 0x97,
  732: 0x98,
  8482: 0x99,
  353: 0x9a,
  8250: 0x9b,
  339: 0x9c,
  382: 0x9e,
  376: 0x9f,
};

const suspiciousCodePoints = new Set<number>([
  0x00c3,
  0x00d0,
  0x00d1,
  0x00c2,
  0x00e4,
  0x00ef,
  0xfffd,
  ...Object.keys(cp1252ByteMap).map(Number),
]);

function containsSuspiciousText(value: string) {
  for (const character of Array.from(value)) {
    if (suspiciousCodePoints.has(character.charCodeAt(0))) {
      return true;
    }
  }

  return false;
}

function scoreReadableText(value: string) {
  let score = 0;

  if (/\p{Script=Cyrillic}/u.test(value)) score += 8;
  if (/\p{Script=Han}/u.test(value)) score += 8;
  if (/[A-Za-z]{3,}/.test(value)) score += 2;
  if (/[\u00c3\u00d0\u00d1\u00c2]/u.test(value)) score -= 8;
  if (value.includes("ï¿½") || value.includes("�")) score -= 12;
  if (value.includes("Ã‚Â°") || value.includes("Â°")) score -= 4;
  if (/[\u0000-\u001f]/.test(value)) score -= 8;

  return score;
}

function toLegacyByte(character: string) {
  const code = character.charCodeAt(0);
  const mapped = cp1252ByteMap[code];
  if (mapped !== undefined) {
    return mapped;
  }

  if (code <= 0xff) {
    return code;
  }

  return null;
}

function decodeUtf8Mist(value: string) {
  const bytes: number[] = [];

  for (const character of Array.from(value)) {
    const byte = toLegacyByte(character);
    if (byte === null) {
      return value.trim();
    }
    bytes.push(byte);
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(Uint8Array.from(bytes)).trim();
}

export function repairText(value: string) {
  if (!containsSuspiciousText(value)) {
    return value;
  }

  let best = value;
  let bestScore = scoreReadableText(value);
  let current = value;

  for (let step = 0; step < 5; step += 1) {
    try {
      const decoded = decodeUtf8Mist(current);
      if (!decoded || decoded === current) {
        break;
      }

      const decodedScore = scoreReadableText(decoded);
      if (decodedScore > bestScore) {
        best = decoded;
        bestScore = decodedScore;
      }
      current = decoded;
    } catch {
      break;
    }
  }

  return best;
}

export function repairDeep<T>(input: T): T {
  if (typeof input === "string") {
    return repairText(input) as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => repairDeep(item)) as T;
  }

  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, repairDeep(value)])) as T;
  }

  return input;
}
