// Collapse Initialization Script - 适用于所有页面的折叠组件初始化

// Toggle collapse item
function toggleCollapseItem(button) {
  const collapseItem = button.closest('.collapse-item');
  collapseItem.classList.toggle('collapsed');
  
  // Update active state - only one item can be active at a time
  if (!collapseItem.classList.contains('collapsed')) {
    // Close all other items and remove their active class
    const container = collapseItem.closest('.collapse-container');
    container.querySelectorAll('.collapse-item').forEach(item => {
      if (item !== collapseItem) {
        item.classList.add('collapsed');
        item.classList.remove('active');
      }
    });
    // Set as active
    collapseItem.classList.add('active');
  } else {
    collapseItem.classList.remove('active');
  }
}

// Delete collapse item
function deleteCollapseItem(button) {
  if (confirm('確定要刪除此項目嗎？')) {
    const collapseItem = button.closest('.collapse-item');
    collapseItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    collapseItem.style.opacity = '0';
    collapseItem.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
      collapseItem.remove();
      updateCollapseIndices(collapseItem.closest('.collapse-container'));
    }, 300);
  }
}

// Update collapse indices after modification
function updateCollapseIndices(container) {
  const items = container.querySelectorAll('.collapse-item');
  items.forEach((item, index) => {
    item.setAttribute('data-index', index);
  });
}

// Add collapse item
function addCollapseItem(containerId) {
  const container = document.getElementById(containerId);
  const items = container.querySelectorAll('.collapse-item');
  const newIndex = items.length;
  
  const newItem = document.createElement('div');
  newItem.className = 'collapse-item collapsed';
  newItem.setAttribute('data-index', newIndex);
  
  newItem.innerHTML = `
    <div class="collapse-header">
      <span class="collapse-title">新增項目 ${newIndex + 1}</span>
      <div class="collapse-actions">
        <button class="collapse-action-btn collapse-btn-add" onclick="addCollapseItem('${containerId}')" title="添加">
          <img src="./assets/images/add_white.svg">
        </button>
        <button class="collapse-action-btn collapse-btn-delete" onclick="deleteCollapseItem(this)" title="刪除">
          <img src="./assets/images/trash.svg">
        </button>
        <button class="collapse-action-btn collapse-btn-toggle" onclick="toggleCollapseItem(this)" title="展開/收起">
          <img src="./assets/images/icon_arrow_down.svg" class="collapse-arrow-default">
          <img src="./assets/images/icon_arrow_down_brown.svg" class="collapse-arrow-brown">
        </button>
      </div>
    </div>
    <div class="collapse-content">
      <div style="font-size: 14px; color: #757575; margin-bottom: 24px;">
        提示文字內容提示文字內容提示文字內容提示文字內容提示文字內容提示文字內容
      </div>
      
      <div class="popup-form-grid">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="input-component">
            <div class="input-header">
              <label class="input-label">
                <span>輸入框標題</span>
                <span class="required">*</span>
              </label>
            </div>
            <div class="input-container">
              <input type="text" class="input-field" placeholder="請輸入">
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="input-component">
            <div class="input-header">
              <label class="input-label">
                <span>輸入框標題</span>
              </label>
            </div>
            <div class="input-container">
              <input type="text" class="input-field" placeholder="請輸入">
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  container.appendChild(newItem);
  
  // Auto expand the new item
  setTimeout(() => {
    toggleCollapseItem(newItem.querySelector('.collapse-btn-toggle'));
  }, 100);
}


