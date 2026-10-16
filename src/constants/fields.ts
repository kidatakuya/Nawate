import { FieldType } from "@/lib/types";

export const textMap: Record<FieldType, string> = {
  [FieldType.YAMADA2]: "山田2",
  [FieldType.YAMADA3]: "山田3",
  [FieldType.IKENOUCHI1]: "池之内1",
};

export const FIELD_OPTIONS: { value: FieldType; label: string }[] = [
  { value: FieldType.YAMADA2, label: textMap[FieldType.YAMADA2] },
  { value: FieldType.YAMADA3, label: textMap[FieldType.YAMADA3] },
  { value: FieldType.IKENOUCHI1, label: textMap[FieldType.IKENOUCHI1] },
];

export function fieldLabel(fieldId: FieldType): string {
  return textMap[fieldId];
}
