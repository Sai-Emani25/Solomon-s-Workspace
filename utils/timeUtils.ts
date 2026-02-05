
/**
 * Returns the current date in Asia/Kolkata (IST) as a date object.
 */
export const getISTDate = (): Date => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);
  
  const dateMap: Record<string, number> = {};
  parts.forEach(({ type, value }) => {
    if (type !== 'literal') dateMap[type] = parseInt(value, 10);
  });
  
  return new Date(dateMap.year, dateMap.month - 1, dateMap.day, dateMap.hour, dateMap.minute, dateMap.second);
};

export const formatDateToKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

export const checkStreak = (lastDateStr: string | null): { newCount: number; shouldUpdate: boolean } => {
  const today = getISTDate();
  const todayKey = formatDateToKey(today);
  
  if (!lastDateStr) {
    return { newCount: 1, shouldUpdate: true };
  }

  const lastLogin = new Date(lastDateStr);
  const lastLoginKey = formatDateToKey(lastLogin);

  if (todayKey === lastLoginKey) {
    return { newCount: 0, shouldUpdate: false }; // Already logged in today
  }

  const diffTime = today.getTime() - lastLogin.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { newCount: 1, shouldUpdate: true }; // Continuous streak
  } else {
    return { newCount: -1, shouldUpdate: true }; // Reset streak
  }
};
