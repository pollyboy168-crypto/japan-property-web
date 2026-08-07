# n8n Code 節點原始碼

n8n 的 Code 節點內容只存在 n8n Cloud 上，改壞了沒有版本紀錄可以回溯，而且
n8n Cloud 的 `/rest/*` API 常常整個沒回應（fetch 一直 pending，不 reject 也不
timeout），改一次要試很多輪。所以把節點程式碼也放進 git 保存一份。

**這裡的檔案不會被 build 進網站**，純粹是給人貼到 n8n 用的參考本。

## 檔案

| 檔案 | 對應的 workflow | n8n workflow id |
|---|---|---|
| `01-properties-code.js` | `01_大阪房產物件` 的 Code 節點 | `TsyPpjdTx4eTi6z5` |

## 貼上去之後要一起確認的設定

`01_大阪房產物件`：

- **Schedule Trigger 要設成 Minutes / 30**（衝量期間）。補滿 1000 筆後改回
  Days / 10:00。程式裡有保險：達到 1000 筆就整個跳過不抓，忘了改也只會空轉。
- Workflow settings 的 timezone 要是 `Asia/Taipei`。
- 下游 HTTP Request 節點負責 POST 到 `/api/sync-properties`，Code 節點只回
  `[{json:{records}}]`，**不要在 Code 節點裡自己 POST**，會變成送兩次。

## 改這支程式前一定要先讀

`CLAUDE.md` 的這兩節，裡面是實際踩過的坑：

- 「⚠️ 物件抓取的輪替索引：一定要『每次執行都前進』」——輪替索引綁日期的話，
  把排程改密完全沒有效果，物件數會卡住不動。
- 「健美家可抓量與解析重點」——價格拆在多層 span、欄位標籤是「住所」不是
  「所在地」、照片是相對路徑等等。
