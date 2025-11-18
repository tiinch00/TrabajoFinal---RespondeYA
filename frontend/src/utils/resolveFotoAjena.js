const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';

export const resolveFotoAjena = (fp) => {
    if (!fp) return null;

    if (fp.startsWith('/assets/')) return fp;              // avatar del front
    if (/^https?:\/\//.test(fp)) return fp;               // URL absoluta
    if (fp.startsWith('/uploads/')) return `${API_URL}${fp}`; // backend típico

    return `${API_URL}${fp}`; // fallback
};
