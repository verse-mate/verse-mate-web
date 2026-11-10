function stripComments(source: string) {
  let out = '';
  let inString = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (inString) {
      out += char;
      if (char === '\\') out += source[++i] ?? '';
      else if (char === '"') inString = false;
    } else if (char === '"') {
      inString = true;
      out += char;
    } else if (char === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      out += '\n';
    } else if (char === '/' && source[i + 1] === '*') {
      i = source.indexOf('*/', i + 2);
      if (i === -1) throw new Error('jsonc: unterminated block comment');
      i++;
    } else {
      out += char;
    }
  }
  return out;
}

export function parseJsonc<T = unknown>(source: string): T {
  return JSON.parse(stripComments(source).replace(/,(\s*[}\]])/g, '$1')) as T;
}
