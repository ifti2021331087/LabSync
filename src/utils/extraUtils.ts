export const EquipmentCategories = [
  { value: "camera", label: "Camera" },
  { value: "lense", label: "Lense" },
  { value: "audio", label: "Audio" },
  { value: "lighting", label: "Lighting" },
  { value: "3d-printer", label: "3D Printer" },
  { value: "electronics", label: "Electronics" },
] as const; // 'as const' makes these values readonly and strictly typed

// export const TIME_SLOTS = [
//   { id: "08:00", label: "08:00 - 10:00", startHour: 8, endHour: 10 },
//   { id: "10:00", label: "10:00 - 12:00", startHour: 10, endHour: 12 },
//   { id: "12:00", label: "12:00 - 14:00", startHour: 12, endHour: 14 },
//   { id: "14:00", label: "14:00 - 16:00", startHour: 14, endHour: 16 },
//   { id: "16:00", label: "16:00 - 18:00", startHour: 16, endHour: 18 },
// ] as const;

export const TIME_SLOTS = [
  { id: "00:00", label: "00:00 - 02:00", startHour: 0, endHour: 2 },
  { id: "02:00", label: "02:00 - 04:00", startHour: 2, endHour: 4 },
  { id: "04:00", label: "04:00 - 06:00", startHour: 4, endHour: 6 },
  { id: "06:00", label: "06:00 - 08:00", startHour: 6, endHour: 8 },
  { id: "08:00", label: "08:00 - 10:00", startHour: 8, endHour: 10 },
  { id: "10:00", label: "10:00 - 12:00", startHour: 10, endHour: 12 },
  { id: "12:00", label: "12:00 - 14:00", startHour: 12, endHour: 14 },
  { id: "14:00", label: "14:00 - 16:00", startHour: 14, endHour: 16 },
  { id: "16:00", label: "16:00 - 18:00", startHour: 16, endHour: 18 },
  { id: "18:00", label: "18:00 - 20:00", startHour: 18, endHour: 20 },
  { id: "20:00", label: "20:00 - 22:00", startHour: 20, endHour: 22 },
  { id: "22:00", label: "22:00 - 00:00", startHour: 22, endHour: 24 },
] as const;
