// Content Loading Management
// 管理 content-panel-content 的 loading 狀態

let loadingTimeout = null;

// Loading 樣式映射表
const LOADING_STYLES = {
  1: 'content-panel-loading-style-1',  // 旋轉樣式 (rotate)
  2: 'content-panel-loading-style-2',  // 脈衝樣式 (spinner)
  'rotate': 'content-panel-loading-style-1',
  'spinner': 'content-panel-loading-style-2'
};

/**
 * 顯示 loading
 * @param {number|object} options - 可以是自動隱藏延遲時間（毫秒），或選項物件
 * @param {number} options.autoHideDelay - 自動隱藏延遲時間（毫秒），預設 5000ms，設為 0 或 false 則不自動隱藏
 * @param {number|string} options.style - loading 樣式，可以是：
 *   - 數字：1 (旋轉樣式) 或 2 (脈衝樣式)
 *   - 字串：'rotate' (旋轉樣式) 或 'spinner' (脈衝樣式)
 *   - 預設為 1 (旋轉樣式)
 * @example
 *   // 使用預設樣式（旋轉）和預設延遲時間
 *   showContentLoading();
 *   
 *   // 使用樣式 2（脈衝）和自訂延遲時間
 *   showContentLoading({ style: 2, autoHideDelay: 3000 });
 *   
 *   // 使用字串指定樣式
 *   showContentLoading({ style: 'rotate', autoHideDelay: 0 }); // 不自動隱藏
 *   
 *   // 舊的用法仍然支援（使用樣式 1）
 *   showContentLoading(5000);
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
    style = 1; // 預設使用樣式 1
  } else if (typeof options === 'object' && options !== null) {
    // 新的用法：傳物件
    autoHideDelay = options.autoHideDelay !== undefined ? options.autoHideDelay : 5000;
    style = options.style !== undefined ? options.style : 1;
  }
  
  // 標準化 style 參數（支援數字和字串）
  let styleId = null;
  if (typeof style === 'number') {
    styleId = LOADING_STYLES[style];
  } else if (typeof style === 'string') {
    styleId = LOADING_STYLES[style.toLowerCase()];
  }
  
  // 驗證 style 參數
  if (!styleId) {
    console.warn(`loading style "${style}" 無效，使用預設值 1 (rotate)`);
    styleId = LOADING_STYLES[1];
  }
  
  // 清除之前的自動隱藏計時器
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
  
  // 獲取 loading spinner 元素
  const loadingContainer = contentPanel.querySelector('.content-panel-loading');
  if (loadingContainer) {
    // 獲取所有可能的 loading 樣式元素
    const allSpinners = loadingContainer.querySelectorAll('[id^="content-panel-loading-style-"]');
    
    // 隱藏所有 spinner
    allSpinners.forEach(spinner => {
      spinner.style.display = 'none';
    });
    
    // 顯示選定的 spinner
    const targetSpinner = loadingContainer.querySelector(`#${styleId}`);
    if (targetSpinner) {
      targetSpinner.style.display = 'flex';
    } else {
      console.warn(`找不到 loading 樣式元素 #${styleId}，請確認 HTML 中已定義該樣式`);
    }
  } else {
    console.warn('找不到 .content-panel-loading 容器元素');
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
  
  // 重置所有 spinner 顯示狀態（確保下次顯示時狀態正確）
  const loadingContainer = contentPanel.querySelector('.content-panel-loading');
  if (loadingContainer) {
    const allSpinners = loadingContainer.querySelectorAll('[id^="content-panel-loading-style-"]');
    allSpinners.forEach(spinner => {
      spinner.style.display = '';
    });
  }
}

// 導出函數供全域使用（如果需要）
if (typeof window !== 'undefined') {
  window.showContentLoading = showContentLoading;
  window.hideContentLoading = hideContentLoading;
}

