export const EquipmentCategories = [
  { value: "camera", label: "Camera" },
  { value: "lense", label: "Lense" },
  { value: "audio", label: "Audio" },
  { value: "lighting", label: "Lighting" },
  { value: "3d-printer", label: "3D Printer" },
  { value: "electronics", label: "Electronics" },
] as const; // 'as const' makes these values readonly and strictly typed

export const TIME_SLOTS = [
  { id: "08:00", label: "08:00 - 10:00", startHour: 8, endHour: 10 },
  { id: "10:00", label: "10:00 - 12:00", startHour: 10, endHour: 12 },
  { id: "12:00", label: "12:00 - 14:00", startHour: 12, endHour: 14 },
  { id: "14:00", label: "14:00 - 16:00", startHour: 14, endHour: 16 },
  { id: "16:00", label: "16:00 - 18:00", startHour: 16, endHour: 18 },
  { id: "18:00", label: "18:00 - 20:00", startHour: 18, endHour: 20 },
] as const;

