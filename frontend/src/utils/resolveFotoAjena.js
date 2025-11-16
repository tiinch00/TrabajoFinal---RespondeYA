const API = 'http://localhost:3006';

export const resolveFotoAjena = (fp) => {
    if (!fp) return null;

    if (fp.startsWith('/assets/')) return fp;              // avatar del front
    if (/^https?:\/\//.test(fp)) return fp;               // URL absoluta
    if (fp.startsWith('/uploads/')) return `${API}${fp}`; // backend típico

    return `${API}${fp}`; // fallback
};
