// Popup Initialization Script - 适用于所有页面的弹窗初始化
(async function initAllPopups() {
  // 确保 popup.js 已经加载
  if (typeof popupManager === 'undefined') {
    console.error('popup.js must be loaded before popup-init.js');
    return;
  }

  try {
    // Load all popup components
    const blankResponse = await fetch('./components/popup-blank.html');
    const blankHtml = await blankResponse.text();
    
    const formResponse = await fetch('./components/popup-form.html');
    const formHtml = await formResponse.text();
    
    const listResponse = await fetch('./components/popup-list.html');
    const listHtml = await listResponse.text();
    
    const listCheckResponse = await fetch('./components/popup-list-check.html');
    const listCheckHtml = await listCheckResponse.text();
    
    const sideResponse = await fetch('./components/popup-side.html');
    const sideHtml = await sideResponse.text();
    
    // Find or create popup components container
    let popupContainer = document.getElementById('popup-components');
    if (!popupContainer) {
      popupContainer = document.createElement('div');
      popupContainer.id = 'popup-components';
      document.body.appendChild(popupContainer);
    }
    
    // Combine all popups
    popupContainer.innerHTML = blankHtml + formHtml + listHtml + listCheckHtml + sideHtml;
    
    // Note: Dropdown initialization is handled by dropdown-init.js
    
    // Register all popups
    popupManager.register('blankPopup');
    popupManager.onConfirm('blankPopup', () => {
      console.log('Blank popup confirmed');
    });
    popupManager.onCancel('blankPopup', () => {
      console.log('Blank popup cancelled');
    });
    
    popupManager.register('formPopup');
    popupManager.onConfirm('formPopup', () => {
      console.log('Form popup confirmed');
    });
    popupManager.onCancel('formPopup', () => {
      console.log('Form popup cancelled');
    });
    
    popupManager.register('listPopup');
    popupManager.onConfirm('listPopup', () => {
      console.log('List popup confirmed');
    });
    popupManager.onCancel('listPopup', () => {
      console.log('List popup cancelled');
    });
    
    popupManager.register('listCheckPopup');
    popupManager.onConfirm('listCheckPopup', () => {
      console.log('List check popup confirmed');
      const checkedBoxes = document.querySelectorAll('#listCheckPopup .checkbox-input:checked');
      const selectedItems = Array.from(checkedBoxes).map(cb => cb.id);
      console.log('Selected items:', selectedItems);
    });
    popupManager.onCancel('listCheckPopup', () => {
      console.log('List check popup cancelled');
    });
    
    popupManager.register('sidePopup');
    popupManager.onConfirm('sidePopup', () => {
      console.log('Side popup confirmed');
    });
    popupManager.onCancel('sidePopup', () => {
      console.log('Side popup cancelled');
    });
    
    console.log('All popups initialized successfully');
    
  } catch (error) {
    console.error('Error initializing popups:', error);
  }
})();

