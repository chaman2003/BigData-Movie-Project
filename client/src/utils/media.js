const PLACEHOLDER_BASE = 'https://placehold.co/500x750/111827/38bdf8?font=montserrat&text=';

const buildPlaceholderText = (title = 'Movie Poster') => {
  const cleanTitle = typeof title === 'string' && title.trim().length > 0
    ? title.trim().replace(/\s+/g, ' ')
    : 'Movie Poster';

  const words = cleanTitle.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const projected = `${currentLine} ${word}`.trim();
    if (projected.length > 12 && currentLine) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = projected;
    }
  });

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  const limitedLines = lines.slice(0, 3);
  const text = limitedLines.join('\n') || 'Movie Poster';
  return `${PLACEHOLDER_BASE}${encodeURIComponent(text)}`;
};

const getSafePosterUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }

  let url = rawUrl.trim();

  // Ensure protocol exists
  if (url.startsWith('//')) {
    url = `https:${url}`;
  }

  if (!/^https?:/i.test(url)) {
    url = `https://${url.replace(/^https?:\/\//i, '')}`;
  }

  const tmdbPattern = /^https?:\/\/image\.tmdb\.org\/.*\/[A-Za-z0-9]+$/i;
  if (tmdbPattern.test(url)) {
    url = `${url}.jpg`;
  }

  if (/\/$/.test(url)) {
    url = `${url}poster.jpg`;
  }

  return url;
};

export const getPosterWithFallback = (rawUrl, title) => {
  const placeholder = buildPlaceholderText(title);
  const safeUrl = getSafePosterUrl(rawUrl);

  return {
    src: safeUrl || placeholder,
    placeholder,
  };
};

export const getPosterPlaceholder = buildPlaceholderText;
