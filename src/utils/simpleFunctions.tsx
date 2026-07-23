export function formatBookingSlot(startTime: Date | string, endTime: Date | string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  // 1. Format the Date (e.g., "Jul 11")
  const datePart = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  // 2. Format times to 24-hour clock (e.g., "13:00")
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Forces 24-hour format instead of AM/PM
  };

  // Some older browsers handle hour12: false weirdly, so doing hourCycle is safer
  timeOptions.hourCycle = 'h23';

  const startTimeStr = start.toLocaleTimeString('en-US', timeOptions);
  const endTimeStr = end.toLocaleTimeString('en-US', timeOptions);

  // 3. Combine with the middle dot (·) and en-dash (–)
  return `${datePart} · ${startTimeStr}–${endTimeStr}`;
}

export function getWeekRangeString(dateString: string | Date): string {
  const date = new Date(dateString);

  // 1. Find the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = date.getDay();

  // 2. Calculate the offset to the previous Monday 
  // (If today is Sunday (0), go back 6 days. Otherwise, go back dayOfWeek - 1)
  const diffToMonday = date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

  // 3. Set exact Start (Monday) and End (Sunday) dates
  const startOfWeek = new Date(date);
  startOfWeek.setDate(diffToMonday);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  // 4. Extract formatting pieces
  const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' });
  const startDay = startOfWeek.getDate();
  const startYear = startOfWeek.getFullYear();

  const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' });
  const endDay = endOfWeek.getDate();
  const endYear = endOfWeek.getFullYear();

  // 5. Construct the string dynamically based on whether months or years overlap
  if (startYear !== endYear) {
    // Example: "Week of Dec 28, 2025 – Jan 3, 2026"
    return `Week of ${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
  }

  if (startMonth !== endMonth) {
    // Example: "Week of Jul 28 – Aug 3, 2026"
    return `Week of ${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`;
  }

  // Example: "Week of Jul 13–19, 2026" (Default behavior)
  return `Week of ${startMonth} ${startDay}–${endDay}, ${startYear}`;
}

export function getWeeklyDayHeaders(dateString: string | Date): string[] {
  const date = new Date(dateString);

  // 1. Find the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = date.getDay();

  // 2. Calculate the offset to the previous Monday 
  const diffToMonday = date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

  // 3. Set the start date to Monday
  const startOfWeek = new Date(date);
  startOfWeek.setDate(diffToMonday);

  const weekDays: string[] = [];

  // 4. Loop 7 times to generate the array
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);

    // Get the short weekday (e.g., "Mon") and uppercase it to "MON"
    const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

    // Get the date number (e.g., 22)
    const dayNumber = currentDay.getDate();

    // Combine them into the requested format
    weekDays.push(`${dayName} ${dayNumber}`);
  }

  return weekDays;
}

export const formatDateTimeForPendingRequest = (start: Date, end: Date) => {
  const dateStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const startTimeStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const endTimeStr = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return `${dateStr} · ${startTimeStr} – ${endTimeStr}`;
};

export function formatCheckoutTime(start: Date | string, end: Date | string): string {
  // Ensure we are working with Date objects
  const startDate = new Date(start);
  const endDate = new Date(end);

  // 1. Calculate the duration
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  
  let durationStr = "";
  if (diffHours < 24) {
    const hours = Math.max(1, diffHours); // Prevent "0 hours"
    durationStr = `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    const diffDays = Math.round(diffHours / 24);
    durationStr = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  }

  // 2. Extract date parts
  const startMonth = startDate.toLocaleString('en-US', { month: 'short' });
  const startDay = startDate.getDate();
  const startYear = startDate.getFullYear();
  
  const endMonth = endDate.toLocaleString('en-US', { month: 'short' });
  const endDay = endDate.getDate();
  const endYear = endDate.getFullYear();

  // 3. Format the date string based on how much the dates differ
  let dateStr = "";

  if (startYear !== endYear) {
    // Different years: Dec 30, 2025 – Jan 2, 2026
    dateStr = `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
  } else if (startMonth !== endMonth) {
    // Same year, different months: May 29 – Jun 2, 2026
    dateStr = `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`;
  } else if (startDay !== endDay) {
    // Same year, same month, different days: Jun 14–15, 2026
    dateStr = `${startMonth} ${startDay}–${endDay}, ${startYear}`;
  } else {
    // Same day: Jun 8, 2026
    dateStr = `${startMonth} ${startDay}, ${startYear}`;
  }

  // 4. Combine and return
  return `${dateStr} · ${durationStr}`;
}