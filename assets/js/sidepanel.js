// Side Panel 功能模組
document.addEventListener('DOMContentLoaded', function() {
  // 獲取所有有子菜單的項目
  const menuItems = document.querySelectorAll('.side-panel-menu-item.has-submenu');
  
  menuItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      const menuId = this.getAttribute('data-menu');
      const submenu = document.querySelector(`[data-parent="${menuId}"]`);
      
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
});
