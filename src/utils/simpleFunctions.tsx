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