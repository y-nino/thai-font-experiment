# 2026-05-29 Revision Log

## File

- `index.html`

## Summary

今天主要根据浏览器预览中的批注，对实体卡片排序实验的数据录入页面做了说明文字、输入提示、视觉引导和表单校验的细节调整。目标是让泰国受试者或录入者更容易理解实体卡片右上角编号和网页输入框之间的对应关系，并减少 placeholder 被误认为已填写内容的问题。

## Changes

### Participant ID

- `participant_id` 的 placeholder 改为：
  - `Example: S1`
- 增加 `participant_id` 格式校验：
  - 必须为 `S1` 到 `S40`
  - `s` 大小写都可以
  - 例如 `s1` 会自动规范化为 `S1`
  - `S0`、`S41`、`A1` 等会被拒绝

### Placeholder Style

- placeholder 颜色从灰色改为参考保存按钮的浅绿色：
  - `#7fa39b`
- 目的是让提示文字和真实输入内容更容易区分。

### Criterion Inputs

- `criterion_label` placeholder 改为：
  - `Example: Formal`
- `criterion_card_id` placeholder 改为：
  - `Example: 2`

### Rank Inputs

- rank 输入框用于填写每张实体卡片的 `card_id`。
- 因为每个 trial 的 10 张卡片不是固定组合，所以 rank 输入框不再显示固定示例数字。
- 最终调整为：
  - 只有 Rank 1 的输入框显示 placeholder：`card_id`
  - Rank 2 到 Rank 10 的输入框不显示 placeholder
- Rank 1 / Rank 10 的强弱提示改为泰语短提示：
  - Rank 1: `มากที่สุด`
  - Rank 10: `น้อยที่สุด`

### Card ID Guide

- 在 rank 输入区域上方加入了内嵌 SVG 示意图。
- 示意图保持在单个 `index.html` 内，不依赖外部图片文件。
- 示意图改为正方形，适合 iPhone 竖屏显示。
- 示意图内容简化：
  - 去掉 `Thai text`
  - 只保留卡片轮廓、浅灰文字占位线和右上角 `a7` 编号标记
- sample card 区域仅说明 `card_id` 在实体卡片右上角：
  - English: `Use the small code in the upper-right corner of each physical card.`
  - Thai: `ใช้รหัสขนาดเล็กที่มุมขวาบนของการ์ดจริง`

### Ranking Instruction

- 将排序填写说明放在 sample card 之前。
- 说明文字明确要求把已经排列好的实体卡片的 `card_id` 填写到下面的 rank 输入框中。
- 英文说明更新为：

```text
Enter the card_id from your sorted physical cards below. Rank 1 is the strongest impression, and Rank 10 is the weakest impression. Enter numbers only: a7 / b7 should be entered as 7.
```

- 泰语说明更新为：

```text
กรอก card_id จากการ์ดจริงที่คุณจัดเรียงไว้ด้านล่าง Rank 1 คือความประทับใจที่มากที่สุด และ Rank 10 คือความประทับใจที่น้อยที่สุด กรอกเฉพาะตัวเลข: a7 / b7 ให้กรอกเป็น 7
```

### Date Display

- 页面右上角日期继续使用浏览器当前日期。
- 日期不是写死值。
- 日期显示会定时刷新。
- JSON / CSV 导出时仍使用导出当下的当前日期。

## Current Data Rules

- `TOTAL_TRIALS = 10`
- 每个 trial 输入 10 个 `card_id`
- `card_id` 范围：1-40
- 同一个 trial 内不能重复 `card_id`
- `criterion_card_id` 必填，范围：1-15
- `criterion_label` 必填
- `judgment_basis` 必填
- `condition` 字段已废弃，统一使用 `cardset`
- `note` 字段已废弃，统一使用 `judgment_basis`

## Verification

- 对 `index.html` 内的脚本做了语法检查。
- 验证了 participant_id 规则：
  - `S41` 会被拒绝
  - `s1` 会通过并规范化为 `S1`
- 验证了 rank placeholder 逻辑：
  - Rank 1 显示 `card_id`
  - 其他 rank 输入框不显示 placeholder
- 验证了说明文字和旧文案没有冲突残留。

## iPhone Preview Method

为了在 iPhone Safari 上确认真实显示效果，使用本地临时服务器预览，而不是直接把 `index.html` 传到 iPhone。

原因：

- 直接在 iPhone 文件预览中打开 `index.html` 时，可能只能看到第一页。
- JavaScript 交互、trial 页面切换、保存和导出等功能可能无法完整测试。
- 通过同一 Wi-Fi 下的本地服务器访问，更接近真实 Safari 网页环境。

由于这台 Mac 的 `python3 -m http.server 8000` 会触发 Command Line Tools / `xcrun` 错误，改用 Ruby 内置 WEBrick 服务器。

在项目文件夹运行：

```bash
cd "/Users/yangning/Library/CloudStorage/OneDrive-学校法人椙山女学園/06_Code/Thai Exp"
ruby -run -e httpd . -p 8000
```

如果终端提示符已经在 `Thai Exp` 文件夹中，则只需要运行：

```bash
ruby -run -e httpd . -p 8000
```

成功启动时会看到类似：

```text
WEBrick::HTTPServer#start: pid=8060 port=8000
```

本次 Mac 的局域网 IP 是：

```text
10.17.80.202
```

iPhone 和 Mac 连接同一个 Wi-Fi 后，在 iPhone Safari 打开：

```text
http://10.17.80.202:8000
```

如果 Mac 弹出允许传入连接的提示，选择允许。

停止服务器：

```text
Control + C
```
