// Dropdown Initialization Script - 适用于所有页面

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all dropdowns
  initializeDropdowns();

  // 示例：監聽 input 元件事件
  document.addEventListener('input-change', function(e) {
    console.log('Input changed:', e.detail);
  });
  
  document.addEventListener('input-search', function(e) {
    console.log('Search triggered:', e.detail);
  });
});

function initializeDropdowns() {
  // Initialize single selection dropdowns
  document.querySelectorAll('.single-dropdown').forEach(dropdown => {
    initializeSingleDropdown(dropdown);
  });

  // Initialize multiple selection dropdowns
  document.querySelectorAll('.multiple-dropdown').forEach(dropdown => {
    initializeMultipleDropdown(dropdown);
  });

  // Initialize searchable single selection dropdowns
  document.querySelectorAll('.searchable-single-dropdown').forEach(dropdown => {
    initializeSearchableSingleDropdown(dropdown);
  });

  // Initialize searchable multiple selection dropdowns
  document.querySelectorAll('.searchable-multiple-dropdown').forEach(dropdown => {
    initializeSearchableMultipleDropdown(dropdown);
  });
}

function initializeSingleDropdown(dropdown) {
  const dropdownInput = dropdown.querySelector('.dropdown-input');
  const dropdownOptions = dropdown.querySelector('.dropdown-options');
  const placeholder = dropdown.querySelector('.dropdown-placeholder');
  const options = dropdown.querySelectorAll('.dropdown-option');

  // Toggle dropdown
  dropdownInput.addEventListener('click', function(e) {
    e.stopPropagation();
    const isActive = dropdownInput.classList.contains('active');
    
    // Close all other dropdowns
    closeAllDropdowns();
    
    // Toggle current dropdown
    if (!isActive) {
      dropdownInput.classList.add('active');
      dropdownOptions.classList.add('active');
    }
  });

  // Handle option selection
  options.forEach(option => {
    option.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Check if clicking on already selected option
      if (this.classList.contains('selected')) {
        // Deselect current option
        this.classList.remove('selected');
        placeholder.textContent = '請選擇';
        placeholder.style.color = '#9E9E9E';
      } else {
        // Remove selected class from all options
        options.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        this.classList.add('selected');
        
        // Update placeholder text
        placeholder.textContent = this.textContent.trim();
        placeholder.style.color = '#292929';
      }
      
      // Close dropdown
      closeDropdown(dropdownInput, dropdownOptions);
    });
  });
}

function initializeMultipleDropdown(dropdown) {
  const dropdownInput = dropdown.querySelector('.dropdown-input');
  const dropdownOptions = dropdown.querySelector('.dropdown-options');
  const tagsContainer = dropdown.querySelector('.dropdown-tags-container');
  const placeholder = tagsContainer.querySelector('.dropdown-placeholder');
  const options = dropdown.querySelectorAll('.dropdown-option');
  let selectedValues = new Set();

  // Initialize with pre-selected options
  options.forEach(option => {
    if (option.classList.contains('selected')) {
      const value = option.dataset.value;
      const text = option.textContent.replace(' ✓', '').trim();
      selectedValues.add(value);
      createTag(tagsContainer, text, value);
    }
  });

  // Hide placeholder if there are selected values
  if (selectedValues.size > 0 && placeholder) {
    placeholder.style.display = 'none';
  }

  // Toggle dropdown
  dropdownInput.addEventListener('click', function(e) {
    e.stopPropagation();
    const isActive = dropdownInput.classList.contains('active');
    
    // Close all other dropdowns
    closeAllDropdowns();
    
    // Toggle current dropdown
    if (!isActive) {
      dropdownInput.classList.add('active');
      dropdownOptions.classList.add('active');
    }
  });

  // Handle option selection
  options.forEach(option => {
    option.addEventListener('click', function(e) {
      e.stopPropagation();
      
      const value = this.dataset.value;
      const text = this.textContent.replace(' ✓', '').trim();
      
      if (selectedValues.has(value)) {
        // Remove selection
        selectedValues.delete(value);
        this.classList.remove('selected');
        this.innerHTML = text;
        removeTag(tagsContainer, value);
      } else {
        // Add selection
        selectedValues.add(value);
        this.classList.add('selected');
        this.innerHTML = text + ' <span class="checkmark">✓</span>';
        createTag(tagsContainer, text, value);
      }
      
      // Show/hide placeholder based on selection
      if (placeholder) {
        placeholder.style.display = selectedValues.size > 0 ? 'none' : 'block';
      }
    });
  });

  // Handle tag removal
  tagsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('dropdown-tag-remove')) {
      e.stopPropagation();
      const tag = e.target.closest('.dropdown-tag');
      const value = tag.dataset.value;
      
      // Remove from selected values
      selectedValues.delete(value);
      
      // Update option
      const option = dropdownOptions.querySelector(`[data-value="${value}"]`);
      if (option) {
        option.classList.remove('selected');
        option.innerHTML = option.textContent.replace(' ✓', '').trim();
      }
      
      // Remove tag
      tag.remove();
      
      // Show placeholder if no selections left
      if (placeholder && selectedValues.size === 0) {
        placeholder.style.display = 'block';
      }
    }
  });
}

function createTag(container, text, value) {
  const tag = document.createElement('div');
  tag.className = 'dropdown-tag';
  tag.dataset.value = value;
  tag.innerHTML = `
    <span>${text}</span>
    <span class="dropdown-tag-remove">×</span>
  `;
  container.appendChild(tag);
}

function removeTag(container, value) {
  const tag = container.querySelector(`[data-value="${value}"]`);
  if (tag) tag.remove();
}

function closeDropdown(dropdownInput, dropdownOptions) {
  dropdownInput.classList.remove('active');
  dropdownOptions.classList.remove('active');
}

function initializeSearchableSingleDropdown(dropdown) {
  const dropdownInput = dropdown.querySelector('.dropdown-input');
  const dropdownOptions = dropdown.querySelector('.dropdown-options');
  const placeholder = dropdown.querySelector('.dropdown-placeholder');
  const searchInput = dropdown.querySelector('.dropdown-search-input');
  const optionsList = dropdown.querySelector('.dropdown-options-list');
  const options = optionsList.querySelectorAll('.dropdown-option');

  // Toggle dropdown
  dropdownInput.addEventListener('click', function(e) {
    e.stopPropagation();
    const isActive = dropdownInput.classList.contains('active');
    
    // Close all other dropdowns
    closeAllDropdowns();
    
    // Toggle current dropdown
    if (!isActive) {
      dropdownInput.classList.add('active');
      dropdownOptions.classList.add('active');
      if (searchInput) searchInput.focus();
    }
  });

  // Handle search input in dropdown
  const dropdownSearchInput = dropdownOptions.querySelector('.dropdown-search-input');
  const dropdownSearchContainer = dropdownOptions.querySelector('.dropdown-search-container');
  
  if (dropdownSearchInput) {
    dropdownSearchInput.addEventListener('input', function(e) {
      e.stopPropagation();
      const searchTerm = this.value.toLowerCase();
      filterOptions(options, searchTerm);
    });
  }
  
  // Prevent dropdown from closing when clicking on search container
  if (dropdownSearchContainer) {
    dropdownSearchContainer.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  // Handle option selection
  options.forEach(option => {
    option.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Check if clicking on already selected option
      if (this.classList.contains('selected')) {
        // Deselect current option
        this.classList.remove('selected');
        placeholder.textContent = '請選擇';
        placeholder.style.color = '#9E9E9E';
      } else {
        // Remove selected class from all options
        options.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        this.classList.add('selected');
        
        // Update placeholder text
        placeholder.textContent = this.textContent.trim();
        placeholder.style.color = '#292929';
      }
      
      // Close dropdown
      closeDropdown(dropdownInput, dropdownOptions);
    });
  });
}

function initializeSearchableMultipleDropdown(dropdown) {
  const dropdownInput = dropdown.querySelector('.dropdown-input');
  const dropdownOptions = dropdown.querySelector('.dropdown-options');
  const tagsContainer = dropdown.querySelector('.dropdown-tags-container');
  const placeholder = tagsContainer.querySelector('.dropdown-placeholder');
  const optionsList = dropdown.querySelector('.dropdown-options-list');
  const options = optionsList.querySelectorAll('.dropdown-option');
  let selectedValues = new Set();

  // Initialize with pre-selected options
  options.forEach(option => {
    if (option.classList.contains('selected')) {
      const value = option.dataset.value;
      const text = option.textContent.replace(' ✓', '').trim();
      selectedValues.add(value);
      createTag(tagsContainer, text, value);
    }
  });

  // Hide placeholder if there are selected values
  if (selectedValues.size > 0 && placeholder) {
    placeholder.style.display = 'none';
  }

  // Toggle dropdown
  dropdownInput.addEventListener('click', function(e) {
    e.stopPropagation();
    const isActive = dropdownInput.classList.contains('active');
    
    // Close all other dropdowns
    closeAllDropdowns();
    
    // Toggle current dropdown
    if (!isActive) {
      dropdownInput.classList.add('active');
      dropdownOptions.classList.add('active');
    }
  });

  // Handle search input in dropdown
  const dropdownSearchInput = dropdownOptions.querySelector('.dropdown-search-input');
  const dropdownSearchContainer = dropdownOptions.querySelector('.dropdown-search-container');
  
  if (dropdownSearchInput) {
    dropdownSearchInput.addEventListener('input', function(e) {
      e.stopPropagation();
      const searchTerm = this.value.toLowerCase();
      filterOptions(options, searchTerm);
    });
  }
  
  // Prevent dropdown from closing when clicking on search container
  if (dropdownSearchContainer) {
    dropdownSearchContainer.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  // Handle option selection
  options.forEach(option => {
    option.addEventListener('click', function(e) {
      e.stopPropagation();
      
      const value = this.dataset.value;
      const text = this.textContent.replace(' ✓', '').trim();
      
      if (selectedValues.has(value)) {
        // Remove selection
        selectedValues.delete(value);
        this.classList.remove('selected');
        this.innerHTML = text;
        removeTag(tagsContainer, value);
      } else {
        // Add selection
        selectedValues.add(value);
        this.classList.add('selected');
        this.innerHTML = text + ' <span class="checkmark">✓</span>';
        createTag(tagsContainer, text, value);
      }
      
      // Show/hide placeholder based on selection
      if (placeholder) {
        placeholder.style.display = selectedValues.size > 0 ? 'none' : 'block';
      }
      
      // Clear search input
      if (dropdownSearchInput) dropdownSearchInput.value = '';
    });
  });

  // Handle tag removal
  tagsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('dropdown-tag-remove')) {
      e.stopPropagation();
      const tag = e.target.closest('.dropdown-tag');
      const value = tag.dataset.value;
      
      // Remove from selected values
      selectedValues.delete(value);
      
      // Update option
      const option = optionsList.querySelector(`[data-value="${value}"]`);
      if (option) {
        option.classList.remove('selected');
        option.innerHTML = option.textContent.replace(' ✓', '').trim();
      }
      
      // Remove tag
      tag.remove();
      
      // Show placeholder if no selections left
      if (placeholder && selectedValues.size === 0) {
        placeholder.style.display = 'block';
      }
    }
  });
}

function filterOptions(options, searchTerm) {
  options.forEach(option => {
    const text = option.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      option.style.display = 'flex';
    } else {
      option.style.display = 'none';
    }
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-input').forEach(input => {
    input.classList.remove('active');
  });
  document.querySelectorAll('.dropdown-options').forEach(options => {
    options.classList.remove('active');
  });
}

// Close dropdown when clicking outside
document.addEventListener('click', function() {
  closeAllDropdowns();
});

