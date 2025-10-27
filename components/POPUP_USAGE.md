# Popup 彈窗組件使用指南

## 概述

彈窗系統採用組件化設計，所有彈窗組件存放在 `components/` 目錄，由統一的 `popup.js` 進行管理。

## 文件結構

```
assets/js/
  └── popup.js          # 彈窗管理器

components/
  ├── popup-blank.html  # 空白彈窗組件
  └── POPUP_USAGE.md    # 本文件
```

## 基本使用

### 1. 創建新的彈窗組件

在 `components/` 目錄下創建新的 HTML 文件，例如 `popup-form.html`:

```html
<div class="popup-overlay" id="formPopup">
  <div class="popup-container">
    <div class="popup-header">
      <span class="popup-title">表單標題</span>
      <button class="popup-close">×</button>
    </div>
    <div class="popup-content">
      <!-- 你的內容 -->
    </div>
    <div class="popup-footer">
      <button class="common-button brown-outline popup-cancel-btn">
        取消
      </button>
      <button class="common-button brown popup-confirm-btn">
        確定
      </button>
    </div>
  </div>
</div>
```

### 2. 在 HTML 中載入組件

在需要使用彈窗的頁面中添加：

```javascript
async function loadPopupComponents() {
  const response = await fetch('./components/popup-blank.html');
  const html = await response.text();
  document.getElementById('popup-components').innerHTML = html;
  
  // 註冊彈窗
  popupManager.register('blankPopup');
  
  // 設定回調
  popupManager.onConfirm('blankPopup', () => {
    console.log('確認被點擊');
  });
  
  popupManager.onCancel('blankPopup', () => {
    console.log('取消被點擊');
  });
}
```

### 3. 打開彈窗

```html
<!-- 使用內聯 onclick -->
<button onclick="openPopup('blankPopup')">打開彈窗</button>

<!-- 或使用 JavaScript -->
<button id="myButton">打開彈窗</button>
<script>
  document.getElementById('myButton').addEventListener('click', () => {
    openPopup('blankPopup');
  });
</script>
```

## API 參考

### `openPopup(popupId, customContent)`

打開指定的彈窗。

**參數：**
- `popupId` (string): 彈窗的 ID
- `customContent` (string, 可選): 要動態設置的內容

**範例：**
```javascript
// 打開空白彈窗
openPopup('blankPopup');

// 打開並設置自訂內容
openPopup('blankPopup', '<p>這是自訂內容</p>');
```

### `closePopup(popupId)`

關閉指定的彈窗。

**參數：**
- `popupId` (string): 彈窗的 ID

**範例：**
```javascript
closePopup('blankPopup');
```

### `setPopupTitle(popupId, title)`

設置彈窗標題。

**參數：**
- `popupId` (string): 彈窗的 ID
- `title` (string): 新標題

**範例：**
```javascript
setPopupTitle('blankPopup', '新標題');
```

### `setPopupConfirmCallback(popupId, callback)`

設置確認按鈕的回調函數。

**參數：**
- `popupId` (string): 彈窗的 ID
- `callback` (function): 回調函數

**範例：**
```javascript
setPopupConfirmCallback('blankPopup', () => {
  console.log('用戶點擊了確認');
  // 執行確認後的邏輯
});
```

### `setPopupCancelCallback(popupId, callback)`

設置取消按鈕的回調函數。

**參數：**
- `popupId` (string): 彈窗的 ID
- `callback` (function): 回調函數

**範例：**
```javascript
setPopupCancelCallback('blankPopup', () => {
  console.log('用戶點擊了取消');
  // 執行取消後的邏輯
});
```

## 事件監聽

彈窗管理器會派發自訂事件：

```javascript
// 監聽彈窗打開事件
document.addEventListener('popup:opened', (e) => {
  console.log('彈窗已打開:', e.detail.popupId);
});

// 監聽彈窗關閉事件
document.addEventListener('popup:closed', (e) => {
  console.log('彈窗已關閉:', e.detail.popupId);
});
```

## 自動功能

- **點擊外部關閉**：點擊彈窗外部區域自動關閉
- **ESC 鍵關閉**：按下 ESC 鍵關閉當前彈窗
- **阻止背景滾動**：彈窗打開時自動禁用背景滾動

## 樣式自訂

彈窗樣式定義在 `assets/css/style.css` 中，主要類別：

- `.popup-overlay`: 彈窗遮罩層
- `.popup-container`: 彈窗容器
- `.popup-header`: 彈窗標題欄
- `.popup-content`: 彈窗內容區
- `.popup-footer`: 彈窗底部按鈕區

可以在 CSS 文件中修改這些樣式來符合你的設計需求。

