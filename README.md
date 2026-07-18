# NGSL Vocabulary Trainer

本機優先的 NGSL 2,809 核心英文單字訓練工具。

## Features

- 程度篩選：把已會單字標成已掌握
- 漸進式複習間隔
- IndexedDB 本機保存學習進度
- Word List 狀態、Rank、IPA 篩選
- JSON 備份與還原

## Data

The app ships with a generated vocabulary asset at `src/data/vocabulary.json`.
IPA is generated from a reviewed US IPA workbook supplied locally for this project.
Original source spreadsheets and planning documents are not included in this public repository.

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm test
pnpm build
```

## Deployment

Push to the `main` branch. GitHub Actions builds the app and deploys `dist` to GitHub Pages.
