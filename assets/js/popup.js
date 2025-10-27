// Popup Manager - 統一管理所有彈窗
class PopupManager {
  constructor() {
    this.popups = {};
    this.init();
  }

  init() {
    // 監聽點擊外部關閉
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('popup-overlay')) {
        this.close(e.target.id);
      }
    });

    // 監聽 ESC 鍵關閉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAll();
      }
    });
  }

  // 註冊彈窗
  register(popupId, options = {}) {
    this.popups[popupId] = {
      id: popupId,
      ...options
    };
  }

  // 打開彈窗
  open(popupId, customContent = null) {
    const popup = document.getElementById(popupId);
    if (!popup) {
      console.error(`Popup ${popupId} not found`);
      return;
    }

    // 如果有自訂內容，更新內容區
    if (customContent) {
      const contentArea = popup.querySelector('.popup-content');
      if (contentArea) {
        contentArea.innerHTML = customContent;
      }
    }

    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // 強制重繪，確保瀏覽器應用初始狀態
    void popup.offsetHeight;

    // 添加 active 類來觸發動畫
    popup.classList.add('active');
    
    // 對於側邊彈窗，已經有滑入動畫
    // 對於其他彈窗，添加淡入動畫
    if (popupId !== 'sidePopup') {
      // 使用 requestAnimationFrame 確保瀏覽器渲染第一幀後再觸發動畫
      requestAnimationFrame(() => {
        // 再次使用 requestAnimationFrame 確保樣式已經應用
        requestAnimationFrame(() => {
          popup.classList.add('entering');
        });
      });
    }

    // 觸發打開事件
    const customEvent = new CustomEvent('popup:opened', { detail: { popupId } });
    document.dispatchEvent(customEvent);
  }

  // 關閉彈窗
  close(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) {
      console.error(`Popup ${popupId} not found`);
      return;
    }

    // 移除 entering 類，添加 exiting 類來觸發退出動畫
    popup.classList.remove('entering');
    popup.classList.add('exiting');

    // 對於側邊彈窗，同時觸發背景淡出和滑出動畫
    if (popupId === 'sidePopup') {
      // 立即移除 active 類來觸發滑出動畫，同時 exiting 類觸發背景淡出
      popup.classList.remove('active');
      
      // 等待動畫完成
      setTimeout(() => {
        popup.style.display = 'none';
        popup.classList.remove('exiting');
        document.body.style.overflow = 'auto';
        
        // 觸發關閉事件
        const customEvent = new CustomEvent('popup:closed', { detail: { popupId } });
        document.dispatchEvent(customEvent);
      }, 300);
    } else {
      // 對於其他彈窗，等待淡出動畫完成
      setTimeout(() => {
        popup.classList.remove('active', 'exiting');
        popup.style.display = 'none';
        document.body.style.overflow = 'auto';

        // 觸發關閉事件
        const customEvent = new CustomEvent('popup:closed', { detail: { popupId } });
        document.dispatchEvent(customEvent);
      }, 300);
    }
  }

  // 關閉所有彈窗
  closeAll() {
    Object.keys(this.popups).forEach(popupId => {
      this.close(popupId);
    });
  }

  // 設置標題
  setTitle(popupId, title) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    const titleElement = popup.querySelector('.popup-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  // 設置確認回調
  onConfirm(popupId, callback) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    const confirmBtn = popup.querySelector('.popup-confirm-btn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        callback();
        this.close(popupId);
      };
    }
  }

  // 設置取消回調
  onCancel(popupId, callback) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    const cancelBtn = popup.querySelector('.popup-cancel-btn');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        if (callback) callback();
        this.close(popupId);
      };
    }

    const closeBtn = popup.querySelector('.popup-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        if (callback) callback();
        this.close(popupId);
      };
    }
  }
}

// 創建全局實例
const popupManager = new PopupManager();

// 導出函數以便在 HTML 中使用
function openPopup(popupId, customContent = null) {
  popupManager.open(popupId, customContent);
}

function closePopup(popupId) {
  popupManager.close(popupId);
}

// 設定為全局函數
window.openPopup = openPopup;
window.closePopup = closePopup;

window.setPopupTitle = function(popupId, title) {
  popupManager.setTitle(popupId, title);
};

window.setPopupConfirmCallback = function(popupId, callback) {
  popupManager.onConfirm(popupId, callback);
};

window.setPopupCancelCallback = function(popupId, callback) {
  popupManager.onCancel(popupId, callback);
};

