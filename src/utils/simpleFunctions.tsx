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