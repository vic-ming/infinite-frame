// Date Picker Initialization Script

document.addEventListener('DOMContentLoaded', function() {
  initializeDatePickers();
});

function initializeDatePickers() {
  // Initialize single date pickers
  document.querySelectorAll('.single-date-picker').forEach(picker => {
    initializeSingleDatePicker(picker);
  });

  // Initialize range date pickers
  document.querySelectorAll('.date-range-picker').forEach(picker => {
    initializeRangeDatePicker(picker);
  });
}

function initializeSingleDatePicker(component) {
  const input = component.querySelector('.date-picker-field');
  const calendar = component.querySelector('.date-picker-calendar');
  const prevBtn = component.querySelector('.prev-month');
  const nextBtn = component.querySelector('.next-month');
  const yearMonth = component.querySelector('.date-picker-year-month');
  const daysContainer = component.querySelector('.date-picker-days');
  
  // If disabled or no calendar element, skip initialization
  if (component.classList.contains('disabled') || !calendar || !prevBtn || !nextBtn || !yearMonth || !daysContainer) {
    return;
  }
  
  let currentDate = new Date();
  let selectedDate = null;
  
  // Parse initial value if exists
  if (input.value) {
    selectedDate = parseDate(input.value);
    if (selectedDate) {
      currentDate = new Date(selectedDate);
    }
  }

  // Toggle calendar
  input.addEventListener('click', function(e) {
    if (!component.classList.contains('disabled') && !input.disabled) {
      e.stopPropagation();
      closeAllCalendars();
      calendar.classList.toggle('active');
      renderCalendar();
    }
  });

  // Handle manual input
  let inputTimeout = null;
  input.addEventListener('input', function(e) {
    // Clear any existing timeout
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }
    
    // Debounce validation - wait for user to finish typing
    inputTimeout = setTimeout(function() {
      validateAndUpdateInput();
    }, 500);
  });

  input.addEventListener('blur', function(e) {
    // Clear timeout and validate immediately on blur
    if (inputTimeout) {
      clearTimeout(inputTimeout);
      inputTimeout = null;
    }
    validateAndUpdateInput();
  });

  function validateAndUpdateInput() {
    const value = input.value.trim();
    
    if (!value) {
      // Empty input - clear selection
      selectedDate = null;
      component.classList.remove('error');
      input.classList.remove('error');
      renderCalendar();
      return;
    }

    // Try to parse the input
    const parsedDate = parseDate(value);
    
    if (parsedDate && isValidDate(parsedDate)) {
      // Valid date - update selection and format
      selectedDate = parsedDate;
      currentDate = new Date(parsedDate);
      input.value = formatDate(parsedDate);
      component.classList.remove('error');
      input.classList.remove('error');
      renderCalendar();
      
      // Trigger custom event
      const event = new CustomEvent('date-selected', {
        detail: { date: parsedDate, formatted: formatDate(parsedDate) }
      });
      component.dispatchEvent(event);
    } else {
      // Invalid date - add error class but don't clear input
      component.classList.add('error');
      input.classList.add('error');
    }
  }

  function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Navigate months
  prevBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    
    yearMonth.querySelector('.year').textContent = year;
    yearMonth.querySelector('.month').textContent = month + 1;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDaysInMonth = new Date(year, month, 0).getDate();
    
    daysContainer.innerHTML = '';
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevDaysInMonth - i;
      const button = document.createElement('button');
      button.className = 'date-picker-day other-month';
      button.textContent = day;
      daysContainer.appendChild(button);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const button = document.createElement('button');
      const date = new Date(year, month, day);
      
      button.className = 'date-picker-day';
      button.textContent = day;
      
      // Check if selected
      if (selectedDate && isSameDay(date, selectedDate)) {
        button.classList.add('selected');
      }
      
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        selectDate(date);
      });
      
      daysContainer.appendChild(button);
    }
    
    // Next month days (fill remaining grid)
    const totalCells = daysContainer.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
      const button = document.createElement('button');
      button.className = 'date-picker-day other-month';
      button.textContent = day;
      daysContainer.appendChild(button);
    }
  }
  
  function selectDate(date) {
    selectedDate = date;
    input.value = formatDate(date);
    calendar.classList.remove('active');
    
    // Trigger custom event
    const event = new CustomEvent('date-selected', {
      detail: { date: date, formatted: formatDate(date) }
    });
    component.dispatchEvent(event);
  }
  
  function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
  
  function parseDate(dateString) {
    if (!dateString) return null;
    
    // Try YYYYMMDD format (e.g., 20250303)
    const trimmed = dateString.trim();
    if (/^\d{8}$/.test(trimmed)) {
      const year = parseInt(trimmed.substring(0, 4), 10);
      const month = parseInt(trimmed.substring(4, 6), 10) - 1;
      const day = parseInt(trimmed.substring(6, 8), 10);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(year, month, day);
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date;
        }
      }
    }
    
    // Try YYYY/MM/DD format
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(year, month, day);
        // Verify the date is valid (handles invalid dates like 2025/02/30)
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date;
        }
      }
    }
    
    // Try YYYY-MM-DD format
    const dashParts = dateString.split('-');
    if (dashParts.length === 3) {
      const year = parseInt(dashParts[0], 10);
      const month = parseInt(dashParts[1], 10) - 1;
      const day = parseInt(dashParts[2], 10);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(year, month, day);
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date;
        }
      }
    }
    
    return null;
  }
  
  // Initial render
  renderCalendar();
}

function initializeRangeDatePicker(component) {
  const input = component.querySelector('.date-picker-field');
  const calendar = component.querySelector('.date-picker-calendar');
  const prevBtn = component.querySelector('.prev-month');
  const nextBtn = component.querySelector('.next-month');
  const yearMonth = component.querySelector('.date-picker-year-month');
  const daysContainer = component.querySelector('.date-picker-days');
  
  // If disabled or no calendar element, skip initialization
  if (component.classList.contains('disabled') || !calendar || !prevBtn || !nextBtn || !yearMonth || !daysContainer) {
    return;
  }
  
  let currentDate = new Date();
  let startDate = null;
  let endDate = null;
  let selectingStart = true;
  
  // Parse initial value if exists
  if (input.value && input.value.includes(' - ')) {
    const parts = input.value.split(' - ');
    startDate = parseDate(parts[0]);
    endDate = parseDate(parts[1]);
    if (startDate) {
      currentDate = new Date(startDate);
    }
  }

  // Toggle calendar
  input.addEventListener('click', function(e) {
    if (!component.classList.contains('disabled') && !input.disabled) {
      e.stopPropagation();
      closeAllCalendars();
      calendar.classList.toggle('active');
      renderCalendar();
    }
  });

  // Handle manual input
  let inputTimeout = null;
  input.addEventListener('input', function(e) {
    // Clear any existing timeout
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }
    
    // Debounce validation - wait for user to finish typing
    inputTimeout = setTimeout(function() {
      validateAndUpdateInput();
    }, 500);
  });

  input.addEventListener('blur', function(e) {
    // Clear timeout and validate immediately on blur
    if (inputTimeout) {
      clearTimeout(inputTimeout);
      inputTimeout = null;
    }
    validateAndUpdateInput();
  });

  function validateAndUpdateInput() {
    const value = input.value.trim();
    
    if (!value) {
      // Empty input - clear selection
      startDate = null;
      endDate = null;
      selectingStart = true;
      component.classList.remove('error');
      input.classList.remove('error');
      renderCalendar();
      return;
    }

    // Check if it's a date range format (contains " - ")
    if (value.includes(' - ')) {
      const parts = value.split(' - ');
      const parsedStart = parseDate(parts[0].trim());
      const parsedEnd = parseDate(parts[1].trim());
      
      if (parsedStart && isValidDate(parsedStart) && parsedEnd && isValidDate(parsedEnd)) {
        // Both dates are valid
        if (parsedStart.getTime() <= parsedEnd.getTime()) {
          startDate = parsedStart;
          endDate = parsedEnd;
          selectingStart = true;
          currentDate = new Date(startDate);
          input.value = `${formatDate(startDate)} - ${formatDate(endDate)}`;
          component.classList.remove('error');
          input.classList.remove('error');
          renderCalendar();
          
          // Trigger custom event
          const event = new CustomEvent('date-range-selected', {
            detail: { 
              startDate: startDate, 
              endDate: endDate,
              formatted: `${formatDate(startDate)} - ${formatDate(endDate)}`
            }
          });
          component.dispatchEvent(event);
        } else {
          // End date is before start date - invalid
          component.classList.add('error');
          input.classList.add('error');
        }
      } else {
        // Invalid date format
        component.classList.add('error');
        input.classList.add('error');
      }
    } else {
      // Single date input - treat as start date
      const parsedDate = parseDate(value);
      if (parsedDate && isValidDate(parsedDate)) {
        startDate = parsedDate;
        endDate = null;
        selectingStart = false;
        currentDate = new Date(parsedDate);
        input.value = formatDate(parsedDate);
        component.classList.remove('error');
        input.classList.remove('error');
        renderCalendar();
      } else {
        // Invalid date
        component.classList.add('error');
        input.classList.add('error');
      }
    }
  }

  function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Navigate months
  prevBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    yearMonth.querySelector('.year').textContent = year;
    yearMonth.querySelector('.month').textContent = month + 1;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDaysInMonth = new Date(year, month, 0).getDate();
    
    daysContainer.innerHTML = '';
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevDaysInMonth - i;
      const button = document.createElement('button');
      button.className = 'date-picker-day other-month';
      button.textContent = day;
      daysContainer.appendChild(button);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const button = document.createElement('button');
      const date = new Date(year, month, day);
      
      button.className = 'date-picker-day';
      button.textContent = day;
      
      // Check if in range
      if (startDate && endDate) {
        if (isSameDay(date, startDate)) {
          button.classList.add('start-date');
        } else if (isSameDay(date, endDate)) {
          button.classList.add('end-date');
        } else if (date.getTime() >= startDate.getTime() && date.getTime() <= endDate.getTime()) {
          button.classList.add('in-range');
        }
      } else if (startDate && isSameDay(date, startDate)) {
        button.classList.add('selected');
      }
      
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        selectDate(date);
      });
      
      daysContainer.appendChild(button);
    }
    
    // Next month days
    const totalCells = daysContainer.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
      const button = document.createElement('button');
      button.className = 'date-picker-day other-month';
      button.textContent = day;
      daysContainer.appendChild(button);
    }
  }
  
  function selectDate(date) {
    if (selectingStart) {
      // Starting new selection
      startDate = new Date(date);
      endDate = null;
      selectingStart = false;
      input.value = formatDate(startDate);
      renderCalendar();
    } else {
      // Selecting end date
      if (!startDate || date.getTime() < startDate.getTime()) {
        // If clicked date is before start date, start new selection
        startDate = new Date(date);
        endDate = null;
        input.value = formatDate(startDate);
        renderCalendar();
      } else {
        // Complete the selection
        endDate = new Date(date);
        
        input.value = `${formatDate(startDate)} - ${formatDate(endDate)}`;
        calendar.classList.remove('active');
        
        // Trigger custom event
        const event = new CustomEvent('date-range-selected', {
          detail: { 
            startDate: startDate, 
            endDate: endDate,
            formatted: `${formatDate(startDate)} - ${formatDate(endDate)}`
          }
        });
        component.dispatchEvent(event);
        
        // Reset for next selection
        selectingStart = true;
      }
    }
  }
  
  function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
  
  function parseDate(dateString) {
    if (!dateString) return null;
    
    // Try YYYYMMDD format (e.g., 20250303)
    const trimmed = dateString.trim();
    if (/^\d{8}$/.test(trimmed)) {
      const year = parseInt(trimmed.substring(0, 4), 10);
      const month = parseInt(trimmed.substring(4, 6), 10) - 1;
      const day = parseInt(trimmed.substring(6, 8), 10);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(year, month, day);
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date;
        }
      }
    }
    
    // Try YYYY/MM/DD format
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(year, month, day);
        // Verify the date is valid (handles invalid dates like 2025/02/30)
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date;
        }
      }
    }
    
    // Try YYYY-MM-DD format
    const dashParts = dateString.split('-');
    if (dashParts.length === 3) {
      const year = parseInt(dashParts[0], 10);
      const month = parseInt(dashParts[1], 10) - 1;
      const day = parseInt(dashParts[2], 10);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(year, month, day);
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date;
        }
      }
    }
    
    return null;
  }
  
  // Initial render
  renderCalendar();
}

function closeAllCalendars() {
  document.querySelectorAll('.date-picker-calendar').forEach(calendar => {
    calendar.classList.remove('active');
  });
}

// Close calendar when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.date-picker-component')) {
    closeAllCalendars();
  }
});

