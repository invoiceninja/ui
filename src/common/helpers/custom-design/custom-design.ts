export const createUniqueId = (dataString: string) => {
  let hash = 0;

  const obj = JSON.parse(dataString);

  const normalizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/\s+/g, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(normalizeObject);
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
          acc[key] = normalizeObject(obj[key]);
          return acc;
        }, {} as Record<string, any>);
    }
    return obj;
  };

  const normalizedString = JSON.stringify(normalizeObject(obj));

  for (let i = 0; i < normalizedString.length; i++) {
    const char = normalizedString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  return Math.abs(hash).toString(16);
};
