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
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
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
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
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

