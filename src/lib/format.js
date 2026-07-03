export const formatDisplayDate = (value) => {
  if (!value) return 'Not available';

  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

export const normalizeTaskStatus = (status = '') => String(status).toLowerCase().replace(/\s+/g, '_');
