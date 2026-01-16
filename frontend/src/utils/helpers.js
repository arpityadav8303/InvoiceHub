// 1. Generate a random ID (useful for temporary frontend lists)
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// 2. Download a Blob (for PDF export)
export const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
};

// 3. Get Initials from Name (e.g., "Arpit Yadav" -> "AY")
export const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// 4. Sleep/Delay (useful for simulating network delay in tests)
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 5. Clean Object (Remove null/undefined values before sending to API)
export const cleanObject = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v != null && v !== '')
    );
};