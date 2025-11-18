// Content Loading Management
// 管理 content-panel-content 的 loading 狀態

let loadingTimeout = null;

/**
 * 顯示 loading
 * @param {number|object} options - 可以是自動隱藏延遲時間（毫秒），或選項物件
 * @param {number} options.autoHideDelay - 自動隱藏延遲時間（毫秒），預設 5000ms，設為 0 或 false 則不自動隱藏
 * @param {number} options.style - loading 樣式編號（1 或 2），預設為 1
 */
function showContentLoading(options = 5000) {
  const contentPanel = document.querySelector('.content-panel-content');
  
  if (!contentPanel) {
    console.warn('找不到 .content-panel-content 元素');
    return;
  }
  
  // 解析參數：支援舊的用法（直接傳數字）和新的用法（傳物件）
  let autoHideDelay = 5000;
  let style = 1;
  
  if (typeof options === 'number') {
    // 舊的用法：直接傳數字作為 autoHideDelay
    autoHideDelay = options;
  } else if (typeof options === 'object' && options !== null) {
    // 新的用法：傳物件
    autoHideDelay = options.autoHideDelay !== undefined ? options.autoHideDelay : 5000;
    style = options.style !== undefined ? options.style : 1;
  }
  
  // 驗證 style 參數
  if (style !== 1 && style !== 2) {
    console.warn('loading style 必須是 1 或 2，使用預設值 1');
    style = 1;
  }
  
  // 清除之前的自動隱藏計時器
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
  
  // 獲取 loading spinner 元素
  const loadingContainer = contentPanel.querySelector('.content-panel-loading');
  if (loadingContainer) {
    const spinner1 = loadingContainer.querySelector('#content-panel-loading-style-1');
    const spinner2 = loadingContainer.querySelector('#content-panel-loading-style-2');
    
    // 根據 style 參數顯示對應的 spinner，隱藏另一個
    if (spinner1 && spinner2) {
      if (style === 1) {
        spinner1.style.display = 'flex';
        spinner2.style.display = 'none';
      } else {
        spinner1.style.display = 'none';
        spinner2.style.display = 'flex';
      }
    }
  }
  
  // 顯示 loading
  contentPanel.classList.add('loading');
  
  // 如果設定了自動隱藏時間，則設定計時器
  if (autoHideDelay && autoHideDelay > 0) {
    loadingTimeout = setTimeout(function() {
      hideContentLoading();
    }, autoHideDelay);
  }
}

/**
 * 隱藏 loading
 */
function hideContentLoading() {
  const contentPanel = document.querySelector('.content-panel-content');
  
  if (!contentPanel) {
    console.warn('找不到 .content-panel-content 元素');
    return;
  }
  
  // 清除自動隱藏計時器
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
  
  // 隱藏 loading
  contentPanel.classList.remove('loading');
  
  // 重置 spinner 顯示狀態（可選，確保下次顯示時狀態正確）
  const loadingContainer = contentPanel.querySelector('.content-panel-loading');
  if (loadingContainer) {
    const spinner1 = loadingContainer.querySelector('#content-panel-loading-style-1');
    const spinner2 = loadingContainer.querySelector('#content-panel-loading-style-2');
    if (spinner1) spinner1.style.display = '';
    if (spinner2) spinner2.style.display = '';
  }
}

// 導出函數供全域使用（如果需要）
if (typeof window !== 'undefined') {
  window.showContentLoading = showContentLoading;
  window.hideContentLoading = hideContentLoading;
}

