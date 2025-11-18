// Content Loading Management
// 管理 content-panel-content 的 loading 狀態

let loadingTimeout = null;

/**
 * 顯示 loading
 * @param {number} autoHideDelay - 自動隱藏延遲時間（毫秒），預設 3000ms，設為 0 或 false 則不自動隱藏
 */
function showContentLoading(autoHideDelay = 3000) {
  const contentPanel = document.querySelector('.content-panel-content');
  
  if (!contentPanel) {
    console.warn('找不到 .content-panel-content 元素');
    return;
  }
  
  // 清除之前的自動隱藏計時器
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
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
}

// 導出函數供全域使用（如果需要）
if (typeof window !== 'undefined') {
  window.showContentLoading = showContentLoading;
  window.hideContentLoading = hideContentLoading;
}

