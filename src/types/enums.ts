export const FieldType = {
  YAMADA2: 'yamada2',
  YAMADA3: 'yamada3',
  IKENOUCHI1: 'ikonouchi1',
} as const

export type FieldType = (typeof FieldType)[keyof typeof FieldType]

export type CropStatus = 'empty' | 'sprouted' | 'growing' | 'flowering' | 'harvested' | 'withered'
