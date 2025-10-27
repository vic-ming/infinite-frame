# 共用元件說明文件

本文檔說明專案中所有可共用的元件及其使用方法。

## 📁 目錄結構

```
assets/
  ├── css/
  │   └── style.css          # 所有元件樣式
  ├── js/
  │   ├── sidepanel.js       # 側邊欄功能
  │   ├── tab.js             # 標籤頁功能
  │   ├── input-components.js # 輸入框元件
  │   ├── popup.js            # 彈窗管理器（核心）
  │   ├── popup-init.js       # 彈窗自動初始化
  │   ├── dropdown-init.js    # 下拉選單自動初始化
  │   └── collapse-init.js    # 折叠組件自動初始化
  └── images/                 # 所有圖片資源

components/
  ├── popup-blank.html        # 空白彈窗組件
  ├── popup-form.html         # 表單彈窗組件
  ├── popup-list.html         # 列表彈窗組件
  ├── popup-list-check.html  # 列表check彈窗組件
  └── popup-side.html         # 側邊彈窗組件
```

## 🎯 元件列表

### 1. 按鈕元件 (Buttons)

#### 基本按鈕類別
- `.common-button.primary` - 主要按鈕（深藍色背景）
- `.common-button.primary-outline` - 主要按鈕（白色背景，深藍色邊框）
- `.common-button.brown` - 棕色按鈕
- `.common-button.brown-outline` - 棕色按鈕（白色背景）
- `.common-button.yellow` - 黃色按鈕
- `.common-button.blue` - 藍色按鈕

#### 使用範例
```html
<button class="common-button primary">按鈕</button>
<button class="common-button primary" disabled>禁用按鈕</button>
```

### 2. 輸入框元件 (Input Components)

#### 基本輸入框
```html
<div class="input-component">
  <div class="input-header">
    <label class="input-label">
      <span>輸入框標題</span>
      <span class="required">*</span>
      <span class="description">敘述敘述敘述</span>
    </label>
    <button class="input-button">
      <img src="./assets/images/scan.svg" class="input-button-icon">
      <img src="./assets/images/scan-white.svg" class="input-button-icon-white">
      按鈕
    </button>
  </div>
  <div class="input-container">
    <input type="text" class="input-field" placeholder="請輸入">
  </div>
</div>
```

#### 帶單位的輸入框
```html
<div class="input-container">
  <div style="position: relative; flex: 1; display: flex;">
    <input type="text" class="input-field with-unit" placeholder="請輸入">
    <div class="input-unit-inline">
      <span>萬元</span>
    </div>
  </div>
</div>
```

#### 帶搜尋圖標的輸入框
```html
<div class="input-search-container">
  <input type="text" class="input-field with-search" placeholder="請輸入">
  <img src="./assets/images/search.svg" class="input-search-icon">
</div>
```

### 3. 下拉選單元件 (Dropdown)

#### 引用初始化腳本
```html
<script src="./assets/js/dropdown-init.js"></script>
```

#### 單選下拉選單
```html
<div class="custom-dropdown single-dropdown">
  <div class="dropdown-input">
    <span class="dropdown-placeholder">請選擇</span>
    <div class="dropdown-arrow"></div>
  </div>
  <div class="dropdown-options">
    <div class="dropdown-option" data-value="value1" data-text="選項一">選項一</div>
    <div class="dropdown-option" data-value="value2" data-text="選項二">選項二</div>
  </div>
</div>
```

#### 多選下拉選單
```html
<div class="custom-dropdown multiple-dropdown">
  <div class="dropdown-input">
    <div class="dropdown-tags-container">
      <span class="dropdown-placeholder">請選擇</span>
    </div>
    <div class="dropdown-arrow"></div>
  </div>
  <div class="dropdown-options">
    <div class="dropdown-option" data-value="value1">選項 A</div>
    <div class="dropdown-option" data-value="value2">選項 B</div>
  </div>
</div>
```

#### 可搜尋式下拉選單
```html
<div class="custom-dropdown searchable-single-dropdown">
  <div class="dropdown-input">
    <span class="dropdown-placeholder">請選擇</span>
    <div class="dropdown-arrow"></div>
  </div>
  <div class="dropdown-options">
    <div class="dropdown-search-container">
      <input type="text" class="dropdown-search-input" placeholder="搜尋">
      <img src="./assets/images/search.svg" class="dropdown-search-icon">
    </div>
    <div class="dropdown-options-list">
      <div class="dropdown-option" data-value="value1">選項一</div>
      <div class="dropdown-option" data-value="value2">選項二</div>
    </div>
  </div>
</div>
```

### 4. 複選框元件 (Checkbox)

#### 基本複選框
```html
<div class="checkbox-component">
  <input type="checkbox" id="checkbox-1" class="checkbox-input">
  <label for="checkbox-1" class="checkbox-label">
    <span class="checkbox-text">勾選項</span>
  </label>
</div>
```

#### 複選框群組
```html
<div class="checkbox-group">
  <div class="checkbox-component">
    <input type="checkbox" id="checkbox-1" class="checkbox-input">
    <label for="checkbox-1" class="checkbox-label">
      <span class="checkbox-text">選項 A</span>
    </label>
  </div>
  <div class="checkbox-component">
    <input type="checkbox" id="checkbox-2" class="checkbox-input">
    <label for="checkbox-2" class="checkbox-label">
      <span class="checkbox-text">選項 B</span>
    </label>
  </div>
</div>
```

### 5. 單選按鈕元件 (Radio)

#### 基本單選按鈕
```html
<div class="radio-component">
  <input type="radio" id="radio-1" name="radio-group" class="radio-input">
  <label for="radio-1" class="radio-label">
    <span class="radio-text">單選項</span>
  </label>
</div>
```

#### 單選按鈕群組
```html
<div class="radio-group">
  <div class="radio-component">
    <input type="radio" id="radio-1" name="radio-group" class="radio-input">
    <label for="radio-1" class="radio-label">
      <span class="radio-text">選項 1</span>
    </label>
  </div>
  <div class="radio-component">
    <input type="radio" id="radio-2" name="radio-group" class="radio-input">
    <label for="radio-2" class="radio-label">
      <span class="radio-text">選項 2</span>
    </label>
  </div>
</div>
```

### 6. 彈窗元件 (Popups)

#### 引用腳本
```html
<!-- 彈窗容器 -->
<div id="popup-components"></div>

<!-- 初始化腳本 -->
<script src="./assets/js/popup.js"></script>
<script src="./assets/js/popup-init.js"></script>
```

#### 可用彈窗列表
- `blankPopup` - 空白彈窗
- `formPopup` - 表單彈窗
- `listPopup` - 列表彈窗
- `listCheckPopup` - 列表check彈窗
- `sidePopup` - 側邊彈窗

#### 使用方法
```html
<!-- 打開彈窗 -->
<button onclick="openPopup('blankPopup')">打開空白彈窗</button>

<!-- JavaScript 方式 -->
<script>
  openPopup('formPopup');
  
  // 設置自訂內容
  openPopup('blankPopup', '<p>自訂內容</p>');
  
  // 設置標題
  setPopupTitle('blankPopup', '新標題');
  
  // 設置回調
  setPopupConfirmCallback('blankPopup', () => {
    console.log('確認按鈕被點擊');
  });
</script>
```

### 7. 折叠組件 (Collapse)

#### 引用腳本
```html
<script src="./assets/js/collapse-init.js"></script>
```

#### 基本結構
```html
<div class="collapse-container" id="myCollapse">
  <div class="collapse-item collapsed">
    <div class="collapse-header">
      <span class="collapse-title">標題</span>
      <div class="collapse-actions">
        <!-- 添加按鈕 -->
        <button class="collapse-action-btn collapse-btn-add" onclick="addCollapseItem('myCollapse')">
          <img src="./assets/images/add_white.svg">
        </button>
        <!-- 刪除按鈕 -->
        <button class="collapse-action-btn collapse-btn-delete" onclick="deleteCollapseItem(this)">
          <img src="./assets/images/trash.svg">
        </button>
        <!-- 展開/收起按鈕 -->
        <button class="collapse-action-btn collapse-btn-toggle" onclick="toggleCollapseItem(this)">
          <img src="./assets/images/icon_arrow_down.svg" class="collapse-arrow-default">
          <img src="./assets/images/icon_arrow_down_brown.svg" class="collapse-arrow-brown">
        </button>
      </div>
    </div>
    <div class="collapse-content">
      <!-- 內容區域 -->
    </div>
  </div>
</div>
```

#### 可用函數
```javascript
// 切換展開/收起
toggleCollapseItem(button)

// 刪除項目
deleteCollapseItem(button)

// 添加新項目
addCollapseItem(containerId)
```

### 8. 表格元件 (Table)

#### 基本表格
```html
<div class="table-container">
  <table class="common-table sticky-header">
    <thead>
      <tr>
        <th>標題1</th>
        <th>標題2</th>
        <th>標題3</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>內容1</td>
        <td>內容2</td>
        <td>內容3</td>
      </tr>
    </tbody>
  </table>
</div>
```

## 🚀 快速開始

### 最小完整頁面設定

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的頁面</title>
  
  <!-- 樣式 -->
  <link rel="stylesheet" href="./assets/css/style.css">
</head>
<body>
  
  <!-- 你的頁面內容 -->
  <div id="app">
    <h1>我的頁面</h1>
    <!-- 添加各種元件 -->
  </div>
  
  <!-- 彈窗容器 -->
  <div id="popup-components"></div>
  
  <!-- 所有必要的腳本 -->
  <script src="./assets/js/input-components.js"></script>
  <script src="./assets/js/popup.js"></script>
  <script src="./assets/js/popup-init.js"></script>
  <script src="./assets/js/dropdown-init.js"></script>
  <script src="./assets/js/collapse-init.js"></script>
  
</body>
</html>
```

## 📋 元件特點

### 彈窗系統
✅ **5種不同彈窗**：空白、表單、列表、列表check、側邊彈窗
✅ **統一管理**：所有彈窗由 `popup.js` 集中管理
✅ **動畫效果**：淡入、縮放、滑入動畫
✅ **自動初始化**：引入 `popup-init.js` 自動載入所有彈窗

### 下拉選單
✅ **4種類型**：單選、多選、可搜尋單選、可搜尋多選
✅ **自動初始化**：引入 `dropdown-init.js` 自動初始化
✅ **標籤顯示**：多選時自動顯示選中的標籤

### 輸入框
✅ **多種類型**：普通、帶單位、帶搜尋圖標、標籤輸入
✅ **狀態支援**：預設、聚焦、錯誤、禁用
✅ **統一樣式**：所有輸入框使用統一的設計語言

### 折叠組件
✅ **展開/收起**：平滑動畫效果
✅ **添加/刪除**：動態添加和刪除項目
✅ **狀態管理**：自動管理 active 狀態

## 🎨 設計系統

### 顏色系統
- **主要色**：`#004D71` (深藍)
- **次要色**：`#9E7F54` (棕色)
- **強調色**：`#F5D93F` (黃色)
- **中性色**：`#9E9E9E` (灰色)
- **邊框色**：`#DCDCDC` (淺灰)

### 字體
- **字體家族**：Noto Sans TC
- **標題大小**：16px - 24px
- **內文大小**：14px
- **小字**：12px

## 💡 使用建議

### 初始化腳本載入順序

```html
<!-- 1. 核心功能（必須） -->
<script src="./assets/js/popup.js"></script>

<!-- 2. 初始化腳本（按需） -->
<script src="./assets/js/popup-init.js"></script>
<script src="./assets/js/dropdown-init.js"></script>
<script src="./assets/js/collapse-init.js"></script>

<!-- 3. 頁面特定功能（按需） -->
<script src="./assets/js/sidepanel.js"></script>
<script src="./assets/js/tab.js"></script>
```

### 元件命名規範
- 使用 `data-*` 屬性存儲數據
- 類名使用連字符命名法（kebab-case）
- ID 使用 camelCase 命名

## 🔧 自訂化

### 自訂彈窗樣式
在 `assets/css/style.css` 中修改以下類別：
```css
.popup-container {
  /* 自訂彈窗外觀 */
}

.popup-header {
  /* 自訂標題欄 */
}
```

### 自訂按鈕樣式
```css
.common-button {
  /* 自訂按鈕樣式 */
}
```

## 📝 注意事項

1. **腳本載入順序**：`popup.js` 必須在 `popup-init.js` 之前載入
2. **路徑問題**：確保所有資源的相對路徑正確
3. **瀏覽器相容性**：支援所有現代瀏覽器
4. **響應式設計**：元件已包含基本的響應式樣式

## 🆘 常見問題

### Q: 彈窗無法打開？
A: 確保已引入 `popup.js` 和 `popup-init.js`，並包含 `<div id="popup-components"></div>`

### Q: 下拉選單無法展開？
A: 確保已引入 `dropdown-init.js`

### Q: Collapse 點擊無反應？
A: 確保已引入 `collapse-init.js`

## 📞 支援

如有問題或建議，請聯繫開發團隊。

