export const normalizeColumnName = (columnName: string): string => {
  if (!columnName) return '';
  return columnName.trimEnd();
};
