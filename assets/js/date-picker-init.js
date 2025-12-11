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
  let viewMode = 'day'; // 'day', 'year', 'month'
  
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
      
      // Reset state when opening calendar
      viewMode = 'day';
      
      // If there's a selected date, use it for display
      if (selectedDate) {
        currentDate = new Date(selectedDate);
      }
      
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

  // Toggle year/month picker view
  yearMonth.addEventListener('click', function(e) {
    e.stopPropagation();
    const nextMode = viewMode === 'day' ? 'year' : 'day';
    viewMode = nextMode;
    renderCalendar();
  });

  // Navigate months/years
  prevBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (viewMode === 'year') {
      currentDate.setFullYear(currentDate.getFullYear() - 20);
    } else if (viewMode === 'month') {
      currentDate.setFullYear(currentDate.getFullYear() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() - 1);
    }
    renderCalendar();
  });

  nextBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (viewMode === 'year') {
      currentDate.setFullYear(currentDate.getFullYear() + 20);
    } else if (viewMode === 'month') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    renderCalendar();
  });

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update year/month display
    yearMonth.querySelector('.year').textContent = year;
    yearMonth.querySelector('.month').textContent = month + 1;
    
    // Update indicator with arrow icon
    const indicator = yearMonth.querySelector('.year-month-indicator');
    if (indicator) {
      let icon = indicator.querySelector('img');
      if (!icon) {
        icon = document.createElement('img');
        icon.src = './assets/images/arrow_date.svg';
        icon.alt = 'toggle';
        icon.className = 'year-month-indicator-icon';
        indicator.textContent = '';
        indicator.appendChild(icon);
      }
      icon.classList.toggle('open', viewMode !== 'day');
    }
    
    // Hide/show weekdays based on view mode
    const weekdays = calendar.querySelector('.date-picker-weekdays');
    if (weekdays) {
      weekdays.style.display = viewMode === 'day' ? 'grid' : 'none';
    }
    
    // Hide/show tabs based on view mode
    const yearMonthTabs = calendar.querySelector('.year-month-tabs');
    if (yearMonthTabs) {
      if (viewMode === 'day') {
        yearMonthTabs.style.display = 'none';
      } else {
        yearMonthTabs.style.display = 'flex';
      }
    }
    
    daysContainer.innerHTML = '';
    
    if (viewMode === 'year') {
      renderYearPicker();
    } else if (viewMode === 'month') {
      renderMonthPicker();
    } else {
      renderDayPicker();
    }
  }
  
  function renderDayPicker() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Reset grid layout for days
    daysContainer.style.gridTemplateColumns = 'repeat(7, 1fr)';
    daysContainer.style.gap = '4px';
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDaysInMonth = new Date(year, month, 0).getDate();
    
    const MAX_CELLS = 35; // limit to 5 rows
    const prevDaysToShow = Math.min(firstDay, MAX_CELLS - daysInMonth);
    
    // Previous month days (bounded to fit 5 rows)
    for (let i = prevDaysToShow - 1; i >= 0; i--) {
      const day = prevDaysInMonth - i;
      const button = document.createElement('button');
      const prevMonthDate = new Date(year, month - 1, day);
      button.className = 'date-picker-day other-month';
      button.textContent = day;
      if (prevMonthDate.getDay() === 6) {
        button.classList.add('sunday');
      }
      daysContainer.appendChild(button);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const button = document.createElement('button');
      const date = new Date(year, month, day);
      
      button.className = 'date-picker-day';
      button.textContent = day;
      if (date.getDay() === 6) {
        button.classList.add('sunday');
      }
      
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
    const remainingCells = Math.max(0, MAX_CELLS - totalCells);
    for (let day = 1; day <= remainingCells; day++) {
      const button = document.createElement('button');
      const nextMonthDate = new Date(year, month + 1, day);
      button.className = 'date-picker-day other-month';
      button.textContent = day;
      if (nextMonthDate.getDay() === 6) {
        button.classList.add('sunday');
      }
      daysContainer.appendChild(button);
    }
  }
  
  function renderYearPicker() {
    const currentYear = currentDate.getFullYear();
    const startYear = Math.floor(currentYear / 20) * 20;
    
    // Set grid layout for years (5 columns x 4 rows)
    daysContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
    daysContainer.style.gap = '8px';
    
    // Create year picker tabs if not exists
    let yearMonthTabs = calendar.querySelector('.year-month-tabs');
    if (!yearMonthTabs) {
      yearMonthTabs = document.createElement('div');
      yearMonthTabs.className = 'year-month-tabs';
      yearMonthTabs.innerHTML = `
        <button class="year-month-tab active" data-tab="year">年份</button>
        <button class="year-month-tab" data-tab="month">月份</button>
      `;
      const header = calendar.querySelector('.date-picker-header');
      header.insertAdjacentElement('afterend', yearMonthTabs);
      yearMonthTabs.style.display = 'flex';
      
      // Tab switching
      yearMonthTabs.querySelectorAll('.year-month-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
          e.stopPropagation();
          yearMonthTabs.querySelectorAll('.year-month-tab').forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          if (this.dataset.tab === 'year') {
            viewMode = 'year';
          } else {
            viewMode = 'month';
          }
          renderCalendar();
        });
      });
    } else {
      yearMonthTabs.style.display = 'flex';
      const yearTab = yearMonthTabs.querySelector('[data-tab="year"]');
      const monthTab = yearMonthTabs.querySelector('[data-tab="month"]');
      if (yearTab) yearTab.classList.add('active');
      if (monthTab) monthTab.classList.remove('active');
    }
    
    // Render years grid (20 years -> 4 rows with 5 columns)
    for (let y = startYear; y < startYear + 20; y++) {
      const button = document.createElement('button');
      button.className = 'date-picker-year';
      button.textContent = y;
      
      if (y === currentYear) {
        button.classList.add('selected');
      }
      
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        // Only update currentDate for display, don't update selectedDate
        currentDate.setFullYear(y);
        viewMode = 'month';
        renderCalendar();
      });
      
      daysContainer.appendChild(button);
    }
  }
  
  function renderMonthPicker() {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Set grid layout for months (2 rows x 6 columns)
    daysContainer.style.gridTemplateColumns = 'repeat(6, 1fr)';
    daysContainer.style.gap = '8px';
    
    // Show year/month tabs
    let yearMonthTabs = calendar.querySelector('.year-month-tabs');
    if (!yearMonthTabs) {
      yearMonthTabs = document.createElement('div');
      yearMonthTabs.className = 'year-month-tabs';
      yearMonthTabs.innerHTML = `
        <button class="year-month-tab" data-tab="year">年份</button>
        <button class="year-month-tab active" data-tab="month">月份</button>
      `;
      const header = calendar.querySelector('.date-picker-header');
      header.insertAdjacentElement('afterend', yearMonthTabs);
      
      // Tab switching
      yearMonthTabs.querySelectorAll('.year-month-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
          e.stopPropagation();
          yearMonthTabs.querySelectorAll('.year-month-tab').forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          if (this.dataset.tab === 'year') {
            viewMode = 'year';
          } else {
            viewMode = 'month';
          }
          renderCalendar();
        });
      });
    } else {
      yearMonthTabs.style.display = 'flex';
      const yearTab = yearMonthTabs.querySelector('[data-tab="year"]');
      const monthTab = yearMonthTabs.querySelector('[data-tab="month"]');
      if (yearTab) yearTab.classList.remove('active');
      if (monthTab) monthTab.classList.add('active');
    }
    
    // Render months grid
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    monthNames.forEach((name, index) => {
      const button = document.createElement('button');
      button.className = 'date-picker-month';
      button.textContent = name;
      
      if (index === currentMonth) {
        button.classList.add('selected');
      }
      
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        // Only update currentDate for display, don't update selectedDate
        currentDate.setMonth(index);
        viewMode = 'day';
        renderCalendar();
      });
      
      daysContainer.appendChild(button);
    });
  }
  
  function selectDate(date) {
    selectedDate = date;
    currentDate = new Date(date); // Update currentDate to match selectedDate
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
  let viewMode = 'day'; // 'day', 'year', 'month'
  
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
      
      // Reset state when opening calendar
      viewMode = 'day';
      selectingStart = true;
      
      // If there's a start date, use it for display
      if (startDate) {
        currentDate = new Date(startDate);
      } else if (endDate) {
        currentDate = new Date(endDate);
      }
      
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

  function extractRangeDates(raw) {
    const trimmed = raw.trim();
    // Explicit " - " separator
    if (trimmed.includes(' - ')) {
      const parts = trimmed.split(' - ');
      if (parts.length >= 2) {
        return [parseDate(parts[0].trim()), parseDate(parts[1].trim())];
      }
    }
    // Hyphen without spaces as separator (e.g., 2025/01/01-2025/01/10 or 20250101-20250110)
    const noSpaceHyphenMatch = trimmed.match(/(.+)-(.+)/);
    if (noSpaceHyphenMatch && noSpaceHyphenMatch[1] && noSpaceHyphenMatch[2]) {
      const left = parseDate(noSpaceHyphenMatch[1].trim());
      const right = parseDate(noSpaceHyphenMatch[2].trim());
      if (left && right) {
        return [left, right];
      }
    }
    // Fallback: detect two date-like tokens in the string
    const dateTokens =
      trimmed.match(/\d{4}[-\/]?\d{1,2}[-\/]?\d{1,2}/g) ||
      trimmed.match(/\d{8}/g) ||
      [];
    if (dateTokens.length >= 2) {
      return [parseDate(dateTokens[0]), parseDate(dateTokens[1])];
    }
    return [null, null];
  }

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

    // Try to read a date range (supports " - " or two date tokens in text)
    const [parsedStart, parsedEnd] = extractRangeDates(value);
    if (parsedStart && isValidDate(parsedStart) && parsedEnd && isValidDate(parsedEnd)) {
      // Normalize order
      if (parsedStart.getTime() > parsedEnd.getTime()) {
        startDate = parsedEnd;
        endDate = parsedStart;
      } else {
        startDate = parsedStart;
        endDate = parsedEnd;
      }
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
      return;
    }

    // Fallback: single date as start (allow trailing hyphen while typing second date)
    const firstTokenMatch = value.match(/\d{4}[-\/]?\d{1,2}[-\/]?\d{1,2}/);
    const parsedDate = parseDate(firstTokenMatch ? firstTokenMatch[0] : value);
    if (parsedDate && isValidDate(parsedDate)) {
      startDate = parsedDate;
      endDate = null;
      selectingStart = false;
      currentDate = new Date(parsedDate);
      // Keep user input intact to allow typing "-" and second date
      component.classList.remove('error');
      input.classList.remove('error');
      renderCalendar();
    } else {
      // Invalid date
      component.classList.add('error');
      input.classList.add('error');
    }
  }

  function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Toggle year/month picker view
  yearMonth.addEventListener('click', function(e) {
    e.stopPropagation();
    const nextMode = viewMode === 'day' ? 'year' : 'day';
    viewMode = nextMode;
    renderCalendar();
  });

  // Navigate months/years
  prevBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (viewMode === 'year') {
      currentDate.setFullYear(currentDate.getFullYear() - 20);
    } else if (viewMode === 'month') {
      currentDate.setFullYear(currentDate.getFullYear() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() - 1);
    }
    renderCalendar();
  });

  nextBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (viewMode === 'year') {
      currentDate.setFullYear(currentDate.getFullYear() + 20);
    } else if (viewMode === 'month') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    renderCalendar();
  });

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update year/month display
    yearMonth.querySelector('.year').textContent = year;
    yearMonth.querySelector('.month').textContent = month + 1;
    
    // Update indicator with arrow icon
    const indicator = yearMonth.querySelector('.year-month-indicator');
    
    if (indicator) {
      let icon = indicator.querySelector('img');
      if (!icon) {
        icon = document.createElement('img');
        icon.src = './assets/images/arrow_date.svg';
        icon.alt = 'toggle';
        icon.className = 'year-month-indicator-icon';
        indicator.textContent = '';
        indicator.appendChild(icon);
      }
      icon.classList.toggle('open', viewMode !== 'day');
    }
    
    // Hide/show weekdays based on view mode
    const weekdays = calendar.querySelector('.date-picker-weekdays');
    if (weekdays) {
      weekdays.style.display = viewMode === 'day' ? 'grid' : 'none';
    }
    
    // Hide/show tabs based on view mode
    const yearMonthTabs = calendar.querySelector('.year-month-tabs');
    if (yearMonthTabs) {
      if (viewMode === 'day') {
        yearMonthTabs.style.display = 'none';
      } else {
        yearMonthTabs.style.display = 'flex';
      }
    }
    
    daysContainer.innerHTML = '';
    
    if (viewMode === 'year') {
      renderYearPicker();
    } else if (viewMode === 'month') {
      renderMonthPicker();
    } else {
      renderDayPicker();
    }
  }
  
  function renderDayPicker() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Reset grid layout for days
    daysContainer.style.gridTemplateColumns = 'repeat(7, 1fr)';
    daysContainer.style.gap = '4px';
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDaysInMonth = new Date(year, month, 0).getDate();
    
    const MAX_CELLS = 35; // limit to 5 rows
    const prevDaysToShow = Math.min(firstDay, MAX_CELLS - daysInMonth);
    
    // Previous month days (bounded to fit 5 rows)
    for (let i = prevDaysToShow - 1; i >= 0; i--) {
      const day = prevDaysInMonth - i;
      const button = document.createElement('button');
      button.className = 'date-picker-day other-month';
      button.textContent = day;
      
      // Make other-month days clickable for range selection
      const prevMonthDate = new Date(year, month - 1, day);
      if (prevMonthDate.getDay() === 6) {
        button.classList.add('sunday');
      }
      
      // Check if in range (for cross-month range display)
      if (startDate && endDate) {
        if (isSameDay(prevMonthDate, startDate)) {
          button.classList.add('start-date');
        } else if (isSameDay(prevMonthDate, endDate)) {
          button.classList.add('end-date');
        } else if (prevMonthDate.getTime() >= startDate.getTime() && prevMonthDate.getTime() <= endDate.getTime()) {
          button.classList.add('in-range');
        }
      } else if (startDate && isSameDay(prevMonthDate, startDate)) {
        button.classList.add('selected');
      }
      
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        // Navigate to previous month and select the date
        currentDate.setMonth(month - 1);
        selectDate(prevMonthDate);
      });
      
      daysContainer.appendChild(button);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const button = document.createElement('button');
      const date = new Date(year, month, day);
      
      button.className = 'date-picker-day';
      button.textContent = day;
      if (date.getDay() === 6) {
        button.classList.add('sunday');
      }
      
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
    const remainingCells = Math.max(0, MAX_CELLS - totalCells);
    for (let day = 1; day <= remainingCells; day++) {
      const button = document.createElement('button');
      button.className = 'date-picker-day other-month';
      button.textContent = day;
      
      // Make other-month days clickable for range selection
      const nextMonthDate = new Date(year, month + 1, day);
      if (nextMonthDate.getDay() === 6) {
        button.classList.add('sunday');
      }
      
      // Check if in range (for cross-month range display)
      if (startDate && endDate) {
        if (isSameDay(nextMonthDate, startDate)) {
          button.classList.add('start-date');
        } else if (isSameDay(nextMonthDate, endDate)) {
          button.classList.add('end-date');
        } else if (nextMonthDate.getTime() >= startDate.getTime() && nextMonthDate.getTime() <= endDate.getTime()) {
          button.classList.add('in-range');
        }
      } else if (startDate && isSameDay(nextMonthDate, startDate)) {
        button.classList.add('selected');
      }
      
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        // Navigate to next month and select the date
        currentDate.setMonth(month + 1);
        selectDate(nextMonthDate);
      });
      
      daysContainer.appendChild(button);
    }
  }
  
  function renderYearPicker() {
    const currentYear = currentDate.getFullYear();
    const startYear = Math.floor(currentYear / 20) * 20;
    
    // Set grid layout for years (5 columns x 4 rows)
    daysContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
    daysContainer.style.gap = '8px';
    
    // Create year picker tabs if not exists
    let yearMonthTabs = calendar.querySelector('.year-month-tabs');
    if (!yearMonthTabs) {
      yearMonthTabs = document.createElement('div');
      yearMonthTabs.className = 'year-month-tabs';
      yearMonthTabs.innerHTML = `
        <button class="year-month-tab active" data-tab="year">年份</button>
        <button class="year-month-tab" data-tab="month">月份</button>
      `;
      const header = calendar.querySelector('.date-picker-header');
      header.insertAdjacentElement('afterend', yearMonthTabs);
      yearMonthTabs.style.display = 'flex';
      
      // Tab switching
      yearMonthTabs.querySelectorAll('.year-month-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
          e.stopPropagation();
          yearMonthTabs.querySelectorAll('.year-month-tab').forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          if (this.dataset.tab === 'year') {
            viewMode = 'year';
          } else {
            viewMode = 'month';
          }
          renderCalendar();
        });
      });
    } else {
      yearMonthTabs.style.display = 'flex';
      const yearTab = yearMonthTabs.querySelector('[data-tab="year"]');
      const monthTab = yearMonthTabs.querySelector('[data-tab="month"]');
      if (yearTab) yearTab.classList.add('active');
      if (monthTab) monthTab.classList.remove('active');
    }
    
    // Render years grid (20 years -> 4 rows with 5 columns)
    for (let y = startYear; y < startYear + 20; y++) {
      const button = document.createElement('button');
      button.className = 'date-picker-year';
      button.textContent = y;
      
      if (y === currentYear) {
        button.classList.add('selected');
      }
      
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        // Only update currentDate for display, don't update selectedDate
        currentDate.setFullYear(y);
        viewMode = 'month';
        renderCalendar();
      });
      
      daysContainer.appendChild(button);
    }
  }
  
  function renderMonthPicker() {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Set grid layout for months (2 rows x 6 columns)
    daysContainer.style.gridTemplateColumns = 'repeat(6, 1fr)';
    daysContainer.style.gap = '8px';
    
    // Show year/month tabs
    let yearMonthTabs = calendar.querySelector('.year-month-tabs');
    if (!yearMonthTabs) {
      yearMonthTabs = document.createElement('div');
      yearMonthTabs.className = 'year-month-tabs';
      yearMonthTabs.innerHTML = `
        <button class="year-month-tab" data-tab="year">年份</button>
        <button class="year-month-tab active" data-tab="month">月份</button>
      `;
      const header = calendar.querySelector('.date-picker-header');
      header.insertAdjacentElement('afterend', yearMonthTabs);
      
      // Tab switching
      yearMonthTabs.querySelectorAll('.year-month-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
          e.stopPropagation();
          yearMonthTabs.querySelectorAll('.year-month-tab').forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          if (this.dataset.tab === 'year') {
            viewMode = 'year';
          } else {
            viewMode = 'month';
          }
          renderCalendar();
        });
      });
    } else {
      yearMonthTabs.style.display = 'flex';
      const yearTab = yearMonthTabs.querySelector('[data-tab="year"]');
      const monthTab = yearMonthTabs.querySelector('[data-tab="month"]');
      if (yearTab) yearTab.classList.remove('active');
      if (monthTab) monthTab.classList.add('active');
    }
    
    // Render months grid
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    monthNames.forEach((name, index) => {
      const button = document.createElement('button');
      button.className = 'date-picker-month';
      button.textContent = name;
      
      if (index === currentMonth) {
        button.classList.add('selected');
      }
      
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        // Only update currentDate for display, don't update selectedDate
        currentDate.setMonth(index);
        viewMode = 'day';
        renderCalendar();
      });
      
      daysContainer.appendChild(button);
    });
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

