document.addEventListener('DOMContentLoaded', function() {
  // Tab 切換功能
  const tabTitles = document.querySelectorAll('.content-panel-content-tab-title span');
  const tabContents = document.querySelectorAll('.content-panel-content-tab-content-item');
  
  tabTitles.forEach(function(tabTitle, index) {
    tabTitle.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 移除所有 tab 標題的 active 類別
      tabTitles.forEach(function(title) {
        title.classList.remove('active');
      });
      
      // 移除所有 tab 內容的 active 類別
      tabContents.forEach(function(content) {
        content.classList.remove('active');
      });
      
      // 為當前點擊的 tab 標題添加 active 類別
      this.classList.add('active');
      
      // 為對應的 tab 內容添加 active 類別
      if (tabContents[index]) {
        tabContents[index].classList.add('active');
      }
    });
  });
});
