export const POINTS_PER_INCH = 72;
export const MILLIMETRES_PER_INCH = 25.4;

export const millimetresToPoints = (millimetres: number) =>
  (millimetres * POINTS_PER_INCH) / MILLIMETRES_PER_INCH;

export const A4_PAGE = {
  width: millimetresToPoints(210),
  height: millimetresToPoints(297),
  padding: millimetresToPoints(20),
} as const;

export const A4_CONTENT = {
  left: A4_PAGE.padding,
  top: A4_PAGE.padding,
  width: A4_PAGE.width - A4_PAGE.padding * 2,
  height: A4_PAGE.height - A4_PAGE.padding * 2,
} as const;
