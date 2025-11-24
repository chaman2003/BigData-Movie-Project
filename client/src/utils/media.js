const PLACEHOLDER_POSTER = 'https://via.placeholder.com/500x750/1a202c/00d4ff?text=Movie+Poster';

export const getSafePosterUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return PLACEHOLDER_POSTER;
  }

  let url = rawUrl.trim();

  // Ensure protocol exists
  if (url.startsWith('//')) {
    url = `https:${url}`;
  }

  if (!url.startsWith('http')) {
    url = `https://${url.replace(/^https?:\/\//, '')}`;
  }

  // Add missing extension for TMDB assets generated without .jpg
  const tmdbPattern = /^https?:\/\/image\.tmdb\.org\/.*\/[A-Za-z0-9]+$/;
  if (tmdbPattern.test(url)) {
    url = `${url}.jpg`;
  }

  // If the URL ends with a slash, append jpg
  if (/\/$/.test(url)) {
    url = `${url}poster.jpg`;
  }

  return url;
};

export const getPosterWithFallback = (rawUrl) => getSafePosterUrl(rawUrl) || PLACEHOLDER_POSTER;
