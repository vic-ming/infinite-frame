// Popup Manager - 統一管理所有彈窗
class PopupManager {
  constructor() {
    this.popups = {};
    this.dragging = null;
    this.dragOffset = { x: 0, y: 0 };
    this.dragHandlers = new WeakMap(); // 存储每个弹窗的拖拽处理函数
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

    // 初始化拖拽功能（侧边弹窗除外）
    if (popupId !== 'sidePopup') {
      this.initDrag(popupId);
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

    // 如果正在拖拽这个弹窗，先结束拖拽
    const popupContainer = popup.querySelector('.popup-container');
    if (this.dragging === popupContainer) {
      this.handleDragEnd();
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
        
        // 重置弹窗容器样式
        if (popupContainer) {
          popupContainer.style.position = '';
          popupContainer.style.margin = '';
          popupContainer.style.top = '';
          popupContainer.style.left = '';
          popupContainer.style.transform = '';
        }
        
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

        // 重置弹窗容器样式
        if (popupContainer) {
          popupContainer.style.position = '';
          popupContainer.style.margin = '';
          popupContainer.style.top = '';
          popupContainer.style.left = '';
          popupContainer.style.transform = '';
        }

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

  // 初始化拖拽功能
  initDrag(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    const popupContainer = popup.querySelector('.popup-container');
    const popupHeader = popup.querySelector('.popup-header');
    
    if (!popupContainer || !popupHeader) return;

    // 如果已经有拖拽处理函数，先移除旧的监听器
    const existingHandler = this.dragHandlers.get(popupHeader);
    if (existingHandler) {
      popupHeader.removeEventListener('mousedown', existingHandler);
    }

    // 重置位置
    popupContainer.style.position = 'relative';
    popupContainer.style.margin = 'auto';
    popupContainer.style.top = '0';
    popupContainer.style.left = '0';
    popupContainer.style.transform = 'none';

    // 设置 header 的 cursor 样式
    popupHeader.style.cursor = 'move';
    
    // 排除关闭按钮，不让它触发拖拽
    const closeBtn = popupHeader.querySelector('.popup-close');
    
    // 创建鼠标按下事件处理函数
    const handleMouseDown = (e) => {
      // 如果点击的是关闭按钮或其子元素，不触发拖拽
      if (closeBtn && (e.target === closeBtn || closeBtn.contains(e.target))) {
        return;
      }

      e.preventDefault();
      this.dragging = popupContainer;
      
      // 获取鼠标相对于弹窗容器的位置
      const rect = popupContainer.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;

      // 改变弹窗容器的定位方式
      popupContainer.style.position = 'fixed';
      popupContainer.style.margin = '0';
      
      // 计算初始位置
      const currentLeft = e.clientX - this.dragOffset.x;
      const currentTop = e.clientY - this.dragOffset.y;
      
      popupContainer.style.left = `${currentLeft}px`;
      popupContainer.style.top = `${currentTop}px`;
      popupContainer.style.transform = 'none';

      // 添加拖拽中的样式
      popupContainer.style.transition = 'none';
      popupHeader.style.userSelect = 'none';
      
      // 绑定全局鼠标移动和释放事件
      document.addEventListener('mousemove', this.handleDragMove);
      document.addEventListener('mouseup', this.handleDragEnd);
    };

    // 存储处理函数以便后续移除
    this.dragHandlers.set(popupHeader, handleMouseDown);
    
    // 添加鼠标按下事件
    popupHeader.addEventListener('mousedown', handleMouseDown);
  }

  // 处理拖拽移动
  handleDragMove = (e) => {
    if (!this.dragging) return;

    e.preventDefault();
    
    // 计算新位置
    let newLeft = e.clientX - this.dragOffset.x;
    let newTop = e.clientY - this.dragOffset.y;

    // 获取视窗和弹窗尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = this.dragging.offsetWidth;
    const popupHeight = this.dragging.offsetHeight;

    // 限制在视窗范围内
    newLeft = Math.max(0, Math.min(newLeft, viewportWidth - popupWidth));
    newTop = Math.max(0, Math.min(newTop, viewportHeight - popupHeight));

    // 应用新位置
    this.dragging.style.left = `${newLeft}px`;
    this.dragging.style.top = `${newTop}px`;
  }

  // 处理拖拽结束
  handleDragEnd = () => {
    if (!this.dragging) return;

    const popupContainer = this.dragging;
    const popupHeader = popupContainer.closest('.popup-overlay')?.querySelector('.popup-header');
    
    // 恢复样式
    popupContainer.style.transition = '';
    if (popupHeader) {
      popupHeader.style.userSelect = '';
    }

    // 清理
    this.dragging = null;
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
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

