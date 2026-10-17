const DEFAULT_MAX_CHARS = 28;

export function truncateWithEllipsis(
  text: string,
  maxChars: number = DEFAULT_MAX_CHARS,
): { display: string; wasTruncated: boolean } {
  if (text.length <= maxChars) {
    return { display: text, wasTruncated: false };
  }
  const sliceEnd = Math.max(0, maxChars - 1);
  return { display: `${text.slice(0, sliceEnd)}…`, wasTruncated: true };
}
