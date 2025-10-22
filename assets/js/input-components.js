/**
 * Input 元件功能模組
 * 提供可重用的 input 元件功能
 */

class InputComponents {
  constructor() {
    this.init();
  }

  init() {
    this.initTagsInput();
    this.initSearchInput();
    this.initDropdownInput();
  }

  /**
   * 初始化標籤輸入框
   */
  initTagsInput() {
    const tagsContainers = document.querySelectorAll('.input-tags-container');
    
    tagsContainers.forEach(container => {
      const input = container.querySelector('.input-tags-field');
      const removeButtons = container.querySelectorAll('.input-tag-remove');
      
      // 處理標籤移除
      removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const tag = button.parentElement;
          tag.remove();
          this.triggerChangeEvent(container);
        });
      });
      
      // 處理輸入
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const value = input.value.trim();
            if (value) {
              this.addTag(container, value);
              input.value = '';
            }
          }
        });
        
        input.addEventListener('blur', () => {
          const value = input.value.trim();
          if (value) {
            this.addTag(container, value);
            input.value = '';
          }
        });
      }
    });
  }

  /**
   * 添加標籤
   */
  addTag(container, text) {
    const tag = document.createElement('div');
    tag.className = 'input-tag';
    tag.innerHTML = `
      <span>${text}</span>
      <span class="input-tag-remove">×</span>
    `;
    
    const input = container.querySelector('.input-tags-field');
    container.insertBefore(tag, input);
    
    // 添加移除事件
    const removeButton = tag.querySelector('.input-tag-remove');
    removeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      tag.remove();
      this.triggerChangeEvent(container);
    });

    this.triggerChangeEvent(container);
  }

  /**
   * 獲取標籤值
   */
  getTagsValue(container) {
    const tags = container.querySelectorAll('.input-tag span:first-child');
    return Array.from(tags).map(tag => tag.textContent);
  }

  /**
   * 設置標籤值
   */
  setTagsValue(container, values) {
    // 清除現有標籤
    const existingTags = container.querySelectorAll('.input-tag');
    existingTags.forEach(tag => tag.remove());
    
    // 添加新標籤
    values.forEach(value => {
      this.addTag(container, value);
    });
  }

  /**
   * 初始化搜索輸入框
   */
  initSearchInput() {
    const searchContainers = document.querySelectorAll('.input-search-container');
    
    searchContainers.forEach(container => {
      const input = container.querySelector('.input-field');
      const icon = container.querySelector('.input-search-icon');
      
      if (icon) {
        icon.addEventListener('click', () => {
          this.triggerSearchEvent(container, input.value);
        });
      }
      
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.triggerSearchEvent(container, input.value);
          }
        });
      }
    });
  }

  /**
   * 觸發搜索事件
   */
  triggerSearchEvent(container, value) {
    const event = new CustomEvent('input-search', {
      detail: { value, container },
      bubbles: true
    });
    container.dispatchEvent(event);
  }

  /**
   * 初始化下拉選單輸入框
   */
  initDropdownInput() {
    const dropdowns = document.querySelectorAll('.input-dropdown');
    
    dropdowns.forEach(dropdown => {
      dropdown.addEventListener('change', () => {
        this.triggerChangeEvent(dropdown);
      });
    });
  }

  /**
   * 觸發變更事件
   */
  triggerChangeEvent(element) {
    const event = new CustomEvent('input-change', {
      detail: { element, value: this.getElementValue(element) },
      bubbles: true
    });
    element.dispatchEvent(event);
  }

  /**
   * 獲取元素值
   */
  getElementValue(element) {
    if (element.classList.contains('input-tags-container')) {
      return this.getTagsValue(element);
    } else if (element.tagName === 'SELECT') {
      return element.value;
    } else if (element.tagName === 'TEXTAREA') {
      return element.value;
    } else if (element.type === 'text' || element.type === 'number') {
      return element.value;
    }
    return '';
  }

  /**
   * 設置元素值
   */
  setElementValue(element, value) {
    if (element.classList.contains('input-tags-container')) {
      this.setTagsValue(element, Array.isArray(value) ? value : [value]);
    } else if (element.tagName === 'SELECT') {
      element.value = value;
    } else if (element.tagName === 'TEXTAREA') {
      element.value = value;
    } else if (element.type === 'text' || element.type === 'number') {
      element.value = value;
    }
  }

  /**
   * 設置錯誤狀態
   */
  setError(element, message) {
    const inputField = element.querySelector('.input-field, .input-dropdown, .input-tags-container');
    if (inputField) {
      inputField.classList.add('error');
    }
    
    // 添加錯誤訊息
    let errorMessage = element.querySelector('.input-error-message');
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.className = 'input-error-message';
      element.appendChild(errorMessage);
    }
    errorMessage.textContent = message;
  }

  /**
   * 清除錯誤狀態
   */
  clearError(element) {
    const inputField = element.querySelector('.input-field, .input-dropdown, .input-tags-container');
    if (inputField) {
      inputField.classList.remove('error');
    }
    
    const errorMessage = element.querySelector('.input-error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  /**
   * 設置禁用狀態
   */
  setDisabled(element, disabled = true) {
    const inputs = element.querySelectorAll('.input-field, .input-dropdown, .input-tags-field');
    const units = element.querySelectorAll('.input-unit');
    const icons = element.querySelectorAll('.input-icon');
    
    inputs.forEach(input => {
      input.disabled = disabled;
      input.classList.toggle('disabled', disabled);
    });
    
    units.forEach(unit => {
      unit.classList.toggle('disabled', disabled);
    });
    
    icons.forEach(icon => {
      icon.classList.toggle('disabled', disabled);
    });
  }

  /**
   * 驗證輸入
   */
  validate(element, rules = {}) {
    const value = this.getElementValue(element);
    const errors = [];
    
    if (rules.required && (!value || (Array.isArray(value) && value.length === 0))) {
      errors.push('此欄位為必填');
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`最少需要 ${rules.minLength} 個字符`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`最多只能 ${rules.maxLength} 個字符`);
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(rules.patternMessage || '格式不正確');
    }
    
    if (errors.length > 0) {
      this.setError(element, errors[0]);
      return false;
    } else {
      this.clearError(element);
      return true;
    }
  }
}

// 創建全域實例
window.inputComponents = new InputComponents();

// 導出類別供模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputComponents;
}
