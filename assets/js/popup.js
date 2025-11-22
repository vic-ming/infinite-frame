// Popup Manager - 統一管理所有彈窗
class PopupManager {
  constructor() {
    this.popups = {};
    this.dragging = null;
    this.dragOffset = { x: 0, y: 0 };
    this.dragHandlers = new WeakMap(); // 存储每个弹窗的拖拽处理函数
    this.resizing = null; // 当前正在缩放的弹窗容器
    this.resizeStartSize = { width: 0, height: 0 };
    this.resizeStartPos = { x: 0, y: 0 };
    this.resizeHandlers = new WeakMap(); // 存储每个弹窗的缩放处理函数
    this.popupStates = new WeakMap(); // 存储每个弹窗的状态（用于最大化和最小化）
    this.init();
  }

  init() {
    // 監聽點擊外部關閉（根據彈窗選項決定是否允許）
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('popup-overlay')) {
        const popupId = e.target.id;
        const popup = document.getElementById(popupId);
        if (popup) {
          // 檢查是否允許點擊背景關閉（默認不允許）
          const allowClose = popup.dataset.closeOnBackdropClick === 'true';
          if (allowClose) {
            this.close(popupId);
          }
        }
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
  open(popupId, customContent = null, options = {}) {
    const popup = document.getElementById(popupId);
    if (!popup) {
      console.error(`Popup ${popupId} not found`);
      return;
    }

    const popupContainer = popup.querySelector('.popup-container');
    
    // 重置弹窗状态到默认值
    if (popupContainer) {
      // 清除之前的状态
      this.popupStates.delete(popupContainer);
      
      // 重置样式
      popupContainer.style.width = '';
      popupContainer.style.height = '';
      popupContainer.style.left = '';
      popupContainer.style.top = '';
      popupContainer.style.position = '';
      popupContainer.style.bottom = '';
      popupContainer.style.right = '';
      popupContainer.style.margin = '';
      popupContainer.style.transform = '';
      popupContainer.classList.remove('minimized', 'maximized');
      
      // 确保内容和底部显示
      const content = popupContainer.querySelector('.popup-content');
      const footer = popupContainer.querySelector('.popup-footer');
      if (content) content.style.display = '';
      if (footer) footer.style.display = '';
    }

    // 如果有自訂內容，更新內容區
    if (customContent) {
      const contentArea = popup.querySelector('.popup-content');
      if (contentArea) {
        contentArea.innerHTML = customContent;
      }
    }

    // 合并选项（优先使用传入的 options，然后是注册时的选项）
    const popupOptions = this.popups[popupId] || {};
    const finalOptions = { ...popupOptions, ...options };

    // 設置是否允許點擊背景關閉（默認不允許）
    const closeOnBackdropClick = finalOptions.closeOnBackdropClick === true;
    popup.dataset.closeOnBackdropClick = closeOnBackdropClick.toString();

    // 設置是否允許背景交互（默認不允許，背景會被鎖定）
    const allowBackgroundInteraction = finalOptions.allowBackgroundInteraction === true;
    popup.dataset.allowBackgroundInteraction = allowBackgroundInteraction.toString();

    popup.style.display = 'flex';
    
    // 如果是多开弹窗，点击时置顶
    if (popupId.includes('_') && popupId !== 'sidePopup') {
      // 计算 z-index（确保新弹窗在最上层）
      const existingPopups = document.querySelectorAll('.popup-overlay.active');
      let maxZIndex = 10000;
      existingPopups.forEach(p => {
        if (p.id !== popupId) {
          const zIndex = parseInt(window.getComputedStyle(p).zIndex) || 10000;
          if (zIndex >= maxZIndex) {
            maxZIndex = zIndex + 1;
          }
        }
      });
      popup.style.zIndex = maxZIndex.toString();
      
      // 点击弹窗时置顶
      const handlePopupClick = (e) => {
        if (e.target === popup || popup.contains(e.target)) {
          const currentZIndex = parseInt(window.getComputedStyle(popup).zIndex) || 10000;
          const allPopups = document.querySelectorAll('.popup-overlay.active');
          let highestZIndex = 10000;
          allPopups.forEach(p => {
            if (p.id !== popupId) {
              const z = parseInt(window.getComputedStyle(p).zIndex) || 10000;
              if (z >= highestZIndex) {
                highestZIndex = z + 1;
              }
            }
          });
          if (currentZIndex < highestZIndex) {
            popup.style.zIndex = (highestZIndex + 1).toString();
          }
        }
      };
      popup.addEventListener('mousedown', handlePopupClick);
    }
    
    // 如果允許背景交互，則不鎖定 body 滾動
    if (!allowBackgroundInteraction) {
      document.body.style.overflow = 'hidden';
    }

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

    // 初始化缩放功能（如果启用）
    if (finalOptions.resizable && popupId !== 'sidePopup') {
      this.initResize(popupId);
      // 添加最大化和最小化按钮
      this.initMinMaxButtons(popupId);
      // 添加双击最小化弹窗header还原功能
      this.initMinimizedHeaderClick(popupId);
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

    // 如果正在缩放这个弹窗，先结束缩放
    if (this.resizing === popupContainer) {
      this.handleResizeEnd();
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
        // 恢復 body 滾動（如果之前被鎖定）
        document.body.style.overflow = 'auto';
        
        // 重置弹窗容器样式
        if (popupContainer) {
          popupContainer.style.position = '';
          popupContainer.style.margin = '';
          popupContainer.style.top = '';
          popupContainer.style.left = '';
          popupContainer.style.transform = '';
          popupContainer.style.width = '';
          popupContainer.style.height = '';
          popupContainer.style.bottom = '';
          popupContainer.style.right = '';
          popupContainer.classList.remove('minimized', 'maximized');
          // 确保内容和底部显示
          const content = popupContainer.querySelector('.popup-content');
          const footer = popupContainer.querySelector('.popup-footer');
          if (content) content.style.display = '';
          if (footer) footer.style.display = '';
          // 移除缩放手柄
          const resizeHandle = popupContainer.querySelector('.popup-resize-handle');
          if (resizeHandle) {
            resizeHandle.remove();
          }
          // 移除最大化和最小化按钮
          const windowControls = popupContainer.querySelector('.popup-window-controls');
          if (windowControls) {
            windowControls.remove();
          }
          // 清除状态
          this.popupStates.delete(popupContainer);
        }

        // 如果是多开弹窗（ID 包含模板 ID 和时间戳），关闭后删除 DOM
        if (popupId.includes('_') && popupId !== 'sidePopup') {
          // 在删除前，如果是最小化的弹窗，先重新排列其他最小化的弹窗
          if (popupContainer && popupContainer.classList.contains('minimized')) {
            popup.remove();
            this.rearrangeMinimizedPopups();
          } else {
            popup.remove();
          }
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
        // 恢復 body 滾動（如果之前被鎖定）
        document.body.style.overflow = 'auto';

        // 重置弹窗容器样式
        if (popupContainer) {
          popupContainer.style.position = '';
          popupContainer.style.margin = '';
          popupContainer.style.top = '';
          popupContainer.style.left = '';
          popupContainer.style.transform = '';
          popupContainer.style.width = '';
          popupContainer.style.height = '';
          popupContainer.style.bottom = '';
          popupContainer.style.right = '';
          popupContainer.classList.remove('minimized', 'maximized');
          // 确保内容和底部显示
          const content = popupContainer.querySelector('.popup-content');
          const footer = popupContainer.querySelector('.popup-footer');
          if (content) content.style.display = '';
          if (footer) footer.style.display = '';
          // 移除缩放手柄
          const resizeHandle = popupContainer.querySelector('.popup-resize-handle');
          if (resizeHandle) {
            resizeHandle.remove();
          }
          // 移除最大化和最小化按钮
          const windowControls = popupContainer.querySelector('.popup-window-controls');
          if (windowControls) {
            windowControls.remove();
          }
          // 清除状态
          this.popupStates.delete(popupContainer);
        }

        // 如果是多开弹窗（ID 包含模板 ID 和时间戳），关闭后删除 DOM
        if (popupId.includes('_') && popupId !== 'sidePopup') {
          // 在删除前，如果是最小化的弹窗，先重新排列其他最小化的弹窗
          if (popupContainer && popupContainer.classList.contains('minimized')) {
            popup.remove();
            this.rearrangeMinimizedPopups();
          } else {
            popup.remove();
          }
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

      // 如果点击的是窗口控制按钮，不触发拖拽
      const windowControls = popupHeader.querySelector('.popup-window-controls');
      if (windowControls && windowControls.contains(e.target)) {
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

  // 初始化缩放功能
  initResize(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    const popupContainer = popup.querySelector('.popup-container');
    if (!popupContainer) return;

    // 检查是否已经有缩放手柄
    let resizeHandle = popupContainer.querySelector('.popup-resize-handle');
    if (!resizeHandle) {
      // 创建缩放手柄
      resizeHandle = document.createElement('div');
      resizeHandle.className = 'popup-resize-handle';
      popupContainer.appendChild(resizeHandle);
    }

    // 如果已经有缩放处理函数，先移除旧的监听器
    const existingHandler = this.resizeHandlers.get(resizeHandle);
    if (existingHandler) {
      resizeHandle.removeEventListener('mousedown', existingHandler);
    }

    // 创建鼠标按下事件处理函数
    const handleMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation(); // 阻止触发拖拽

      this.resizing = popupContainer;
      
      // 获取当前弹窗的尺寸和位置
      const rect = popupContainer.getBoundingClientRect();
      this.resizeStartSize.width = rect.width;
      this.resizeStartSize.height = rect.height;
      this.resizeStartPos.x = e.clientX;
      this.resizeStartPos.y = e.clientY;

      // 确保弹窗容器有固定定位（如果正在拖拽）
      if (popupContainer.style.position === 'fixed') {
        // 保持固定定位
      } else {
        // 如果还没有固定定位，先获取当前位置
        const currentRect = popupContainer.getBoundingClientRect();
        popupContainer.style.position = 'fixed';
        popupContainer.style.left = `${currentRect.left}px`;
        popupContainer.style.top = `${currentRect.top}px`;
        popupContainer.style.margin = '0';
      }

      // 添加缩放中的样式
      popupContainer.style.transition = 'none';
      resizeHandle.style.userSelect = 'none';
      
      // 绑定全局鼠标移动和释放事件
      document.addEventListener('mousemove', this.handleResizeMove);
      document.addEventListener('mouseup', this.handleResizeEnd);
    };

    // 存储处理函数以便后续移除
    this.resizeHandlers.set(resizeHandle, handleMouseDown);
    
    // 添加鼠标按下事件
    resizeHandle.addEventListener('mousedown', handleMouseDown);
  }

  // 处理缩放移动
  handleResizeMove = (e) => {
    if (!this.resizing) return;

    e.preventDefault();
    
    // 计算鼠标移动的距离
    const deltaX = e.clientX - this.resizeStartPos.x;
    const deltaY = e.clientY - this.resizeStartPos.y;

    // 计算新尺寸
    let newWidth = this.resizeStartSize.width + deltaX;
    let newHeight = this.resizeStartSize.height + deltaY;

    // 只限制最小尺寸（不限制最大宽度和高度，允许超出视窗）
    const minWidth = 400;
    const minHeight = 300;

    // 限制尺寸（只限制最小值）
    newWidth = Math.max(minWidth, newWidth);
    newHeight = Math.max(minHeight, newHeight);

    // 应用新尺寸
    this.resizing.style.width = `${newWidth}px`;
    this.resizing.style.height = `${newHeight}px`;
  }

  // 处理缩放结束
  handleResizeEnd = () => {
    if (!this.resizing) return;

    const popupContainer = this.resizing;
    const resizeHandle = popupContainer.querySelector('.popup-resize-handle');
    
    // 恢复样式
    popupContainer.style.transition = '';
    if (resizeHandle) {
      resizeHandle.style.userSelect = '';
    }

    // 清理
    this.resizing = null;
    document.removeEventListener('mousemove', this.handleResizeMove);
    document.removeEventListener('mouseup', this.handleResizeEnd);
  }

  // 初始化最大化和最小化按钮
  initMinMaxButtons(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    const popupHeader = popup.querySelector('.popup-header');
    if (!popupHeader) return;

    // 检查是否已经有按钮
    if (popupHeader.querySelector('.popup-minimize-btn') || popupHeader.querySelector('.popup-maximize-btn')) {
      return;
    }

    const popupContainer = popup.querySelector('.popup-container');
    if (!popupContainer) return;

    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'popup-window-controls';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '8px';
    buttonContainer.style.alignItems = 'center';

    // 创建最小化按钮
    const minimizeBtn = document.createElement('button');
    minimizeBtn.className = 'popup-minimize-btn';
    minimizeBtn.innerHTML = '−';
    minimizeBtn.title = '最小化';
    minimizeBtn.onclick = () => this.minimize(popupId);

    // 创建最大化/还原按钮
    const maximizeBtn = document.createElement('button');
    maximizeBtn.className = 'popup-maximize-btn';
    maximizeBtn.innerHTML = '□';
    maximizeBtn.title = '最大化';
    maximizeBtn.onclick = () => this.toggleMaximize(popupId);

    // 创建还原按钮（用于从最小化状态恢复，与最大化时的还原按钮一样）
    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'popup-restore-btn';
    restoreBtn.innerHTML = '❐';
    restoreBtn.title = '還原';
    restoreBtn.style.display = 'none'; // 默认隐藏
    restoreBtn.onclick = () => this.restore(popupId);

    buttonContainer.appendChild(minimizeBtn);
    buttonContainer.appendChild(maximizeBtn);
    buttonContainer.appendChild(restoreBtn);

    // 插入到关闭按钮之前（在关闭按钮左侧）
    const closeBtn = popupHeader.querySelector('.popup-close');
    if (closeBtn) {
      popupHeader.insertBefore(buttonContainer, closeBtn);
    } else {
      // 如果没有关闭按钮，添加到 header 末尾
      popupHeader.appendChild(buttonContainer);
    }
  }

  // 最小化弹窗
  minimize(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    const popupContainer = popup.querySelector('.popup-container');
    if (!popupContainer) return;

    const state = this.popupStates.get(popupContainer) || {};
    
    // 如果还没有保存原始状态（第一次最大化或最小化操作），保存当前状态
    // 这个状态是最大化/最小化之前的大小和位置
    if (!state.originalStyle) {
      const rect = popupContainer.getBoundingClientRect();
      // 获取当前实际的大小和位置（如果 style 中没有，使用 getBoundingClientRect）
      const currentWidth = popupContainer.style.width || `${rect.width}px`;
      const currentHeight = popupContainer.style.height || `${rect.height}px`;
      
      // 如果弹窗还没有固定定位，需要先获取当前位置
      let currentLeft = popupContainer.style.left;
      let currentTop = popupContainer.style.top;
      let currentPosition = popupContainer.style.position;
      
      if (!currentPosition || currentPosition === 'relative') {
        currentPosition = 'fixed';
        currentLeft = `${rect.left}px`;
        currentTop = `${rect.top}px`;
        popupContainer.style.position = 'fixed';
        popupContainer.style.left = currentLeft;
        popupContainer.style.top = currentTop;
        popupContainer.style.margin = '0';
      }
      
      state.originalStyle = {
        width: currentWidth,
        height: currentHeight,
        left: currentLeft,
        top: currentTop,
        position: currentPosition,
        bottom: popupContainer.style.bottom || '',
        right: popupContainer.style.right || '',
        margin: popupContainer.style.margin || ''
      };
    }

    // 如果当前是最大化状态，先清除最大化，但标记之前是最大化状态
    if (state.isMaximized) {
      popupContainer.classList.remove('maximized');
      state.wasMaximized = true;
      state.isMaximized = false;
    } else {
      state.wasMaximized = false;
    }

    // 设置为最小化状态
    popupContainer.style.width = '300px';
    popupContainer.style.height = '60px';
    popupContainer.style.position = 'fixed';
    
    // 如果是多开弹窗（ID包含下划线），从下往上排列
    if (popupId.includes('_') && popupId !== 'sidePopup') {
      // 计算当前有多少个最小化的多开弹窗
      const minimizedPopups = Array.from(document.querySelectorAll('.popup-overlay.active'))
        .filter(p => {
          const container = p.querySelector('.popup-container');
          return container && 
                 container.classList.contains('minimized') && 
                 p.id.includes('_') && 
                 p.id !== popupId;
        });
      
      // 每个最小化弹窗的高度是 60px，间距是 10px，所以每个需要 70px 的空间
      const minimizedHeight = 60;
      const spacing = 10;
      const bottomOffset = 20; // 距离底部的初始距离
      const bottomPosition = bottomOffset + minimizedPopups.length * (minimizedHeight + spacing);
      
      popupContainer.style.bottom = `${bottomPosition}px`;
      popupContainer.style.right = '20px';
    } else {
      // 非多开弹窗保持原来的位置
      popupContainer.style.bottom = '20px';
      popupContainer.style.right = '20px';
    }
    
    popupContainer.style.left = 'auto';
    popupContainer.style.top = 'auto';
    popupContainer.classList.add('minimized');

    // 隐藏内容和底部
    const content = popupContainer.querySelector('.popup-content');
    const footer = popupContainer.querySelector('.popup-footer');
    if (content) content.style.display = 'none';
    if (footer) footer.style.display = 'none';

    // 隐藏最小化按钮，显示最大化按钮和还原按钮
    const minimizeBtn = popup.querySelector('.popup-minimize-btn');
    const maximizeBtn = popup.querySelector('.popup-maximize-btn');
    const restoreBtn = popup.querySelector('.popup-restore-btn');
    if (minimizeBtn) minimizeBtn.style.display = 'none';
    if (restoreBtn) {
      restoreBtn.style.display = 'flex';
      // 还原按钮与最大化时的还原按钮一样
      restoreBtn.innerHTML = '❐';
      restoreBtn.title = '還原';
    }
    if (maximizeBtn) {
      maximizeBtn.style.display = 'flex';
      // 显示最大化图标
      maximizeBtn.innerHTML = '□';
      maximizeBtn.title = '最大化';
    }

    // 隐藏缩放手柄（最小化时不可缩放）
    const resizeHandle = popupContainer.querySelector('.popup-resize-handle');
    if (resizeHandle) {
      resizeHandle.style.display = 'none';
    }

    state.isMinimized = true;
    state.wasMaximized = false; // 重置标记
    this.popupStates.set(popupContainer, state);
  }

  // 切换最大化状态
  toggleMaximize(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    const popupContainer = popup.querySelector('.popup-container');
    if (!popupContainer) return;

    const state = this.popupStates.get(popupContainer) || {};
    const maximizeBtn = popup.querySelector('.popup-maximize-btn');

    if (state.isMaximized) {
      // 还原到原始状态（最大化/最小化之前的大小和位置）
      if (state.originalStyle) {
        // 恢复所有样式属性
        popupContainer.style.width = state.originalStyle.width || '';
        popupContainer.style.height = state.originalStyle.height || '';
        popupContainer.style.left = state.originalStyle.left || '';
        popupContainer.style.top = state.originalStyle.top || '';
        popupContainer.style.position = state.originalStyle.position || '';
        popupContainer.style.bottom = state.originalStyle.bottom || '';
        popupContainer.style.right = state.originalStyle.right || '';
        popupContainer.style.margin = state.originalStyle.margin || '';
      } else {
        // 如果没有原始状态，恢复到默认
        popupContainer.style.width = '';
        popupContainer.style.height = '';
        popupContainer.style.left = '';
        popupContainer.style.top = '';
        popupContainer.style.position = '';
        popupContainer.style.bottom = '';
        popupContainer.style.right = '';
        popupContainer.style.margin = '';
      }
      popupContainer.classList.remove('maximized');
      state.isMaximized = false;
      if (maximizeBtn) {
        maximizeBtn.innerHTML = '□';
        maximizeBtn.title = '最大化';
        // 如果是最小化状态，确保按钮显示
        if (state.isMinimized) {
          maximizeBtn.style.display = 'flex';
        }
      }

      // 显示缩放手柄（从最大化状态还原后可以缩放，除非是最小化状态）
      if (!state.isMinimized) {
        const resizeHandle = popupContainer.querySelector('.popup-resize-handle');
        if (resizeHandle) {
          resizeHandle.style.display = 'block';
        }
      }
    } else {
      // 如果还没有保存原始状态（第一次最大化或最小化操作），保存当前状态
      // 这个状态是最大化/最小化之前的大小和位置
      if (!state.originalStyle) {
        // 如果当前是最小化状态，需要先获取最小化之前的状态
        // 但最小化时已经保存了，所以这里应该不会执行
        // 如果是从正常状态最大化，保存当前状态
        if (!state.isMinimized) {
          const rect = popupContainer.getBoundingClientRect();
          // 获取当前实际的大小和位置（如果 style 中没有，使用 getBoundingClientRect）
          const currentWidth = popupContainer.style.width || `${rect.width}px`;
          const currentHeight = popupContainer.style.height || `${rect.height}px`;
          
          // 如果弹窗还没有固定定位，需要先获取当前位置
          let currentLeft = popupContainer.style.left;
          let currentTop = popupContainer.style.top;
          let currentPosition = popupContainer.style.position;
          
          if (!currentPosition || currentPosition === 'relative') {
            currentPosition = 'fixed';
            currentLeft = `${rect.left}px`;
            currentTop = `${rect.top}px`;
            popupContainer.style.position = 'fixed';
            popupContainer.style.left = currentLeft;
            popupContainer.style.top = currentTop;
            popupContainer.style.margin = '0';
          }
          
          state.originalStyle = {
            width: currentWidth,
            height: currentHeight,
            left: currentLeft,
            top: currentTop,
            position: currentPosition,
            bottom: popupContainer.style.bottom || '',
            right: popupContainer.style.right || '',
            margin: popupContainer.style.margin || ''
          };
        }
      }

      // 如果当前是最小化状态，先恢复内容和底部
      if (state.isMinimized) {
        const content = popupContainer.querySelector('.popup-content');
        const footer = popupContainer.querySelector('.popup-footer');
        if (content) content.style.display = '';
        if (footer) footer.style.display = '';
        popupContainer.classList.remove('minimized');
        state.isMinimized = false;
        // 恢复最小化按钮显示，隐藏还原按钮
        const minimizeBtn = popup.querySelector('.popup-minimize-btn');
        const restoreBtn = popup.querySelector('.popup-restore-btn');
        if (minimizeBtn) minimizeBtn.style.display = 'flex';
        if (restoreBtn) restoreBtn.style.display = 'none';
      }

      // 最大化 - 填满整个画面
      popupContainer.style.width = '100vw';
      popupContainer.style.height = '100vh';
      popupContainer.style.left = '0';
      popupContainer.style.top = '0';
      popupContainer.style.bottom = 'auto';
      popupContainer.style.right = 'auto';
      popupContainer.style.position = 'fixed';
      popupContainer.style.margin = '0';
      popupContainer.classList.add('maximized');
      state.isMaximized = true;
      if (maximizeBtn) {
        maximizeBtn.innerHTML = '❐';
        maximizeBtn.title = '還原';
      }

      // 隐藏缩放手柄（最大化时不可缩放）
      const resizeHandle = popupContainer.querySelector('.popup-resize-handle');
      if (resizeHandle) {
        resizeHandle.style.display = 'none';
      }
    }

    this.popupStates.set(popupContainer, state);
  }

  // 还原弹窗（从最小化状态）
  restore(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    const popupContainer = popup.querySelector('.popup-container');
    if (!popupContainer) return;

    const state = this.popupStates.get(popupContainer) || {};
    if (!state.isMinimized) return;

    // 恢复内容和底部
    const content = popupContainer.querySelector('.popup-content');
    const footer = popupContainer.querySelector('.popup-footer');
    if (content) content.style.display = '';
    if (footer) footer.style.display = '';

    // 恢复原始状态（最大化/最小化之前的大小和位置）
    if (state.originalStyle) {
      // 恢复所有样式属性
      popupContainer.style.width = state.originalStyle.width || '';
      popupContainer.style.height = state.originalStyle.height || '';
      popupContainer.style.left = state.originalStyle.left || '';
      popupContainer.style.top = state.originalStyle.top || '';
      popupContainer.style.position = state.originalStyle.position || '';
      popupContainer.style.bottom = state.originalStyle.bottom || '';
      popupContainer.style.right = state.originalStyle.right || '';
      popupContainer.style.margin = state.originalStyle.margin || '';
    } else {
      popupContainer.style.width = '';
      popupContainer.style.height = '';
      popupContainer.style.left = '';
      popupContainer.style.top = '';
      popupContainer.style.position = '';
      popupContainer.style.bottom = '';
      popupContainer.style.right = '';
      popupContainer.style.margin = '';
    }

    popupContainer.classList.remove('minimized');
    state.isMinimized = false;

    // 恢复按钮显示状态
    const minimizeBtn = popup.querySelector('.popup-minimize-btn');
    const maximizeBtn = popup.querySelector('.popup-maximize-btn');
    const restoreBtn = popup.querySelector('.popup-restore-btn');
    if (minimizeBtn) minimizeBtn.style.display = 'flex';
    if (restoreBtn) restoreBtn.style.display = 'none';
    if (maximizeBtn) {
      maximizeBtn.style.display = 'flex';
      maximizeBtn.innerHTML = '□';
      maximizeBtn.title = '最大化';
    }

    // 显示缩放手柄（还原后可以缩放）
    const resizeHandle = popupContainer.querySelector('.popup-resize-handle');
    if (resizeHandle) {
      resizeHandle.style.display = 'block';
    }

    this.popupStates.set(popupContainer, state);

    // 如果是多开弹窗，重新排列其他最小化的弹窗
    if (popupId.includes('_') && popupId !== 'sidePopup') {
      this.rearrangeMinimizedPopups();
    }
  }

  // 重新排列所有最小化的多开弹窗
  rearrangeMinimizedPopups() {
    const minimizedPopups = Array.from(document.querySelectorAll('.popup-overlay.active'))
      .filter(p => {
        const container = p.querySelector('.popup-container');
        return container && 
               container.classList.contains('minimized') && 
               p.id.includes('_') && 
               p.id !== 'sidePopup';
      })
      .sort((a, b) => {
        // 按照当前的 bottom 值排序（从下往上）
        const aBottom = parseInt(a.querySelector('.popup-container').style.bottom) || 0;
        const bBottom = parseInt(b.querySelector('.popup-container').style.bottom) || 0;
        return aBottom - bBottom;
      });

    const minimizedHeight = 60;
    const spacing = 10;
    const bottomOffset = 20;

    minimizedPopups.forEach((popup, index) => {
      const container = popup.querySelector('.popup-container');
      if (container) {
        const bottomPosition = bottomOffset + index * (minimizedHeight + spacing);
        container.style.bottom = `${bottomPosition}px`;
      }
    });
  }

  // 初始化最小化弹窗header点击还原功能
  initMinimizedHeaderClick(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    const popupHeader = popup.querySelector('.popup-header');
    if (!popupHeader) return;

    // 添加点击事件来还原最小化的弹窗
    popupHeader.addEventListener('dblclick', (e) => {
      const popupContainer = popup.querySelector('.popup-container');
      if (popupContainer && popupContainer.classList.contains('minimized')) {
        // 如果点击的不是按钮，则还原
        if (!e.target.closest('button')) {
          this.restore(popupId);
        }
      }
    });
  }

  // 打開可多開的彈窗（支持縮放/最大化/最小化）
  openMulti(templateId, customContent = null, options = {}) {
    // 生成唯一的彈窗 ID
    const instanceId = `${templateId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 獲取模板彈窗
    const templatePopup = document.getElementById(templateId);
    if (!templatePopup) {
      console.error(`Template popup ${templateId} not found`);
      return null;
    }

    // 克隆模板彈窗
    const newPopup = templatePopup.cloneNode(true);
    newPopup.id = instanceId;
    newPopup.style.display = 'none';
    
    // 更新內部元素的 ID（避免重複）
    const popupContainer = newPopup.querySelector('.popup-container');
    if (popupContainer) {
      // 更新所有可能有 ID 的元素
      const elementsWithId = newPopup.querySelectorAll('[id]');
      elementsWithId.forEach(el => {
        if (el.id && !el.id.startsWith(instanceId)) {
          const originalId = el.id;
          el.id = `${instanceId}_${originalId}`;
          // 更新相關的 for 屬性（label 等）
          if (el.tagName === 'LABEL' && el.getAttribute('for')) {
            el.setAttribute('for', `${instanceId}_${el.getAttribute('for')}`);
          }
        }
      });
    }

    // 添加到頁面
    const popupComponentsContainer = document.getElementById('popup-components') || document.body;
    popupComponentsContainer.appendChild(newPopup);

    // 設置默認選項（多開彈窗默認支持縮放、最大化、最小化，並允許背景交互）
    const defaultOptions = {
      resizable: true,
      allowBackgroundInteraction: true,
      ...options
    };

    // 計算 z-index（確保新彈窗在最上層）
    const existingPopups = document.querySelectorAll('.popup-overlay.active');
    let maxZIndex = 10000;
    existingPopups.forEach(p => {
      const zIndex = parseInt(window.getComputedStyle(p).zIndex) || 10000;
      if (zIndex >= maxZIndex) {
        maxZIndex = zIndex + 1;
      }
    });
    newPopup.style.zIndex = maxZIndex.toString();

    // 註冊彈窗
    this.register(instanceId, defaultOptions);

    // 打開新彈窗
    this.open(instanceId, customContent, defaultOptions);

    // 設置關閉按鈕事件
    const closeBtn = newPopup.querySelector('.popup-close');
    if (closeBtn) {
      closeBtn.onclick = () => this.close(instanceId);
    }

    // 設置取消和確認按鈕事件（如果有的話）
    const cancelBtn = newPopup.querySelector('.popup-cancel-btn');
    const confirmBtn = newPopup.querySelector('.popup-confirm-btn');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        if (options.onCancel) options.onCancel();
        this.close(instanceId);
      };
    }
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        if (options.onConfirm) options.onConfirm();
        this.close(instanceId);
      };
    }

    return instanceId;
  }
}

// 創建全局實例
const popupManager = new PopupManager();

// 導出函數以便在 HTML 中使用
function openPopup(popupId, customContent = null, options = {}) {
  popupManager.open(popupId, customContent, options);
}

function closePopup(popupId) {
  popupManager.close(popupId);
}

// 打開可多開的彈窗（支持縮放/最大化/最小化）
function openMultiPopup(templateId, customContent = null, options = {}) {
  return popupManager.openMulti(templateId, customContent, options);
}

// 設定為全局函數
window.openPopup = openPopup;
window.closePopup = closePopup;
window.openMultiPopup = openMultiPopup;

window.setPopupTitle = function(popupId, title) {
  popupManager.setTitle(popupId, title);
};

window.setPopupConfirmCallback = function(popupId, callback) {
  popupManager.onConfirm(popupId, callback);
};

window.setPopupCancelCallback = function(popupId, callback) {
  popupManager.onCancel(popupId, callback);
};

