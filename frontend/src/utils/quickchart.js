// src/utils/quickchart.js
export function buildQuickChartURL({ 
    config, 
    width = 700, 
    height = 400, 
    format = 'png', 
    backgroundColor = 'transparent' 
}) {
    const base = 'https://quickchart.io/chart';
    const params = new URLSearchParams({
        c: JSON.stringify(config),
        width: String(width),
        height: String(height),
        format,
        backgroundColor,
    });
    return `${base}?${params.toString()}`;
}
