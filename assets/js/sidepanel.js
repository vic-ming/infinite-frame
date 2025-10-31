// Side Panel 功能模組
document.addEventListener('DOMContentLoaded', function() {
  // 處理一級菜單項目的點擊展開/收合（保持原有功能）
  const topLevelMenuItems = document.querySelectorAll('.side-panel-menu > .side-panel-menu-item.has-submenu');
  
  topLevelMenuItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      const menuId = this.getAttribute('data-menu');
      const submenu = document.querySelector(`.submenu-level-1[data-parent="${menuId}"]`);
      
      if (submenu) {
        // 切換展開狀態
        const isExpanded = submenu.classList.contains('expanded');
        
        if (isExpanded) {
          // 收縮
          submenu.classList.remove('expanded');
          this.classList.remove('expanded');
        } else {
          // 展開
          submenu.classList.add('expanded');
          this.classList.add('expanded');
        }
      }
    });
  });
  
  // 處理二級項目的hover事件 - 三級目錄在右側彈出
  const secondLevelMenuItems = document.querySelectorAll('.submenu-level-1 .side-panel-menu-item.has-submenu');
  
  secondLevelMenuItems.forEach(function(item) {
    const menuId = item.getAttribute('data-menu');
    const thirdLevelSubmenu = document.querySelector(`.submenu-level-2[data-parent="${menuId}"]`);
    
    if (thirdLevelSubmenu) {
      // 更新三級目錄位置的函數
      function updateSubmenuPosition() {
        const rect = item.getBoundingClientRect();
        thirdLevelSubmenu.style.left = (rect.right + 4) + 'px';
        thirdLevelSubmenu.style.top = rect.top + 'px';
      }
      
      // 鼠標移入二級項目時顯示三級目錄
      item.addEventListener('mouseenter', function() {
        updateSubmenuPosition();
        thirdLevelSubmenu.classList.add('show');
        item.classList.add('show-submenu'); // 添加類以保持hover效果
      });
      
      // 鼠標移出二級項目和三級目錄時隱藏
      item.addEventListener('mouseleave', function(e) {
        // 檢查鼠標是否移動到三級目錄
        const relatedTarget = e.relatedTarget;
        if (relatedTarget && !thirdLevelSubmenu.contains(relatedTarget)) {
          thirdLevelSubmenu.classList.remove('show');
          item.classList.remove('show-submenu'); // 移除類
        }
      });
      
      // 三級目錄本身的hover處理
      thirdLevelSubmenu.addEventListener('mouseenter', function() {
        updateSubmenuPosition();
        this.classList.add('show');
        item.classList.add('show-submenu'); // 確保二級項目保持hover效果
      });
      
      thirdLevelSubmenu.addEventListener('mouseleave', function(e) {
        const relatedTarget = e.relatedTarget;
        if (relatedTarget && !item.contains(relatedTarget)) {
          this.classList.remove('show');
          item.classList.remove('show-submenu'); // 移除類
        }
      });
      
      // 窗口大小改變或滾動時更新位置
      function handlePositionUpdate() {
        if (thirdLevelSubmenu.classList.contains('show')) {
          updateSubmenuPosition();
        }
      }
      
      window.addEventListener('resize', handlePositionUpdate);
      window.addEventListener('scroll', handlePositionUpdate, true); // 使用capture來捕獲所有滾動事件
    }
  });
  
  // 為普通菜單項添加點擊事件（可選）
  const regularMenuItems = document.querySelectorAll('.side-panel-menu-item:not(.has-submenu)');
  regularMenuItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 移除所有活動狀態
      document.querySelectorAll('.side-panel-menu-item').forEach(function(menuItem) {
        menuItem.classList.remove('active');
      });
      
      // 添加活動狀態到當前項目
      this.classList.add('active');
    });
  });
  
  // 處理側邊欄收起/展開功能
  const collapseButton = document.querySelector('.side-panel-collapse');
  const sidePanel = document.querySelector('.side-panel');
  
  if (collapseButton && sidePanel) {
    collapseButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      sidePanel.classList.toggle('collapsed');
    });
  }
  
  // 處理頂部欄收起/展開功能
  const headerCollapseButton = document.querySelector('.header-collapse');
  const contentPanelHeader = document.querySelector('.content-panel-header');
  
  if (headerCollapseButton && contentPanelHeader) {
    headerCollapseButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      contentPanelHeader.classList.toggle('collapsed');
      // 同時更新按鈕狀態
      headerCollapseButton.classList.toggle('collapsed');
    });
  }
  
  // 處理收起狀態下的控制按鈕
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const headerToggle = document.querySelector('.header-toggle');
  
  // 展開側邊欄
  if (sidebarToggle && sidePanel) {
    sidebarToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      sidePanel.classList.remove('collapsed');
    });
  }
  
  // 切換 header（收起狀態下的按鈕）
  if (headerToggle && contentPanelHeader) {
    headerToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      contentPanelHeader.classList.toggle('collapsed');
      
      // 如果 header-collapse 按鈕存在，也同步更新它的狀態
      if (headerCollapseButton) {
        headerCollapseButton.classList.toggle('collapsed');
      }
    });
  }
});
