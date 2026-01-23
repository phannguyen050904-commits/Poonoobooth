// Utility functions
export function safeLog(...args) { 
  console.log(...args); 
}

export function safeErr(...args) { 
  console.error(...args); 
}

export const $ = id => document.getElementById(id);

// Timestamp formatting
export function formatTimestamp(date, format, customFormat = '') {
  const DD = String(date.getDate()).padStart(2, '0');
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const YYYY = date.getFullYear();
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'dd/mm/yyyy': return `${DD}/${MM}/${YYYY}`;
    case 'mm/dd/yyyy': return `${MM}/${DD}/${YYYY}`;
    case 'yyyy-mm-dd': return `${YYYY}-${MM}-${DD}`;
    case 'full': return `${DD}/${MM}/${YYYY} ${HH}:${mm}:${ss}`;
    case 'custom':
      if (!customFormat) return `${DD}/${MM}/${YYYY}`;
      return customFormat
        .replace('DD', DD).replace('MM', MM).replace('YYYY', YYYY)
        .replace('HH', HH).replace('mm', mm).replace('ss', ss);
    default: return `${DD}/${MM}/${YYYY}`;
  }
}