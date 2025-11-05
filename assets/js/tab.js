document.addEventListener('DOMContentLoaded', function() {
  // 外層 Tab 切換功能
  const tabTitles = document.querySelectorAll('.content-panel-content-tab-title span');
  const tabContents = document.querySelectorAll('.content-panel-content-tab-content > .content-panel-content-tab-content-item');
  
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
        // Reinitialize dropdowns in the newly active tab
        if (typeof initializeDropdowns === 'function') {
          setTimeout(() => {
            initializeDropdowns();
          }, 100);
        }
      }
    });
  });

  // 內層二級 Tab 切換功能
  const tab2Titles = document.querySelectorAll('.content-panel-content-tab-2-title span');
  const tab2Contents = document.querySelectorAll('.content-panel-content-tab-2-content-item');
  
  tab2Titles.forEach(function(tab2Title, index) {
    tab2Title.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 移除所有內層 tab 標題的 active 類別
      tab2Titles.forEach(function(title) {
        title.classList.remove('active');
      });
      
      // 移除所有內層 tab 內容的 active 類別
      tab2Contents.forEach(function(content) {
        content.classList.remove('active');
      });
      
      // 為當前點擊的內層 tab 標題添加 active 類別
      this.classList.add('active');
      
      // 為對應的內層 tab 內容添加 active 類別
      if (tab2Contents[index]) {
        tab2Contents[index].classList.add('active');
        // Reinitialize dropdowns in the newly active tab
        if (typeof initializeDropdowns === 'function') {
          setTimeout(() => {
            initializeDropdowns();
          }, 100);
        }
      }
    });
  });
});
