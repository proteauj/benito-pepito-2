export type Dimension = {
  width: number;
  height: number;
  unit: 'in' | 'cm';
};

export const sizeDimensions: Record<string, Dimension[]> = {
  XS: [
    { width: 9, height: 7, unit: 'in' },
  ],
  S: [
    { width: 10, height: 8, unit: 'in' },
    // { width: 12, height: 6, unit: 'in' },
    { width: 12, height: 9, unit: 'in' },
  ],
  M: [
    { width: 14, height: 11, unit: 'in' },
    { width: 16, height: 12, unit: 'in' },
  ],
  L: [
    { width: 18, height: 14, unit: 'in' },
    // { width: 20, height: 16, unit: 'in' },
    { width: 24, height: 12, unit: 'in' },
  ],
  XL: [
    { width: 18, height: 24, unit: 'in' },
  ],
  XXL: [
    { width: 36, height: 24, unit: 'in' },
    { width: 36, height: 45, unit: 'in' },
  ],
};
