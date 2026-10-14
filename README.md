# AJITH Audit Studio

The master dashboard is in `index.html`. It links to the production tools already published on GitHub Pages and includes the supplied local 2A/2B consolidator, tax-PDF-to-Excel converter and PDF workspace.

## Free publishing

1. Create a GitHub repository and upload this folder.
2. In the repository, open **Settings → Pages**.
3. Select **Deploy from a branch**, then choose `main` and `/ (root)`.
4. Save. GitHub supplies a public `github.io` address for the dashboard.

The dashboard is a static site: no server, database, or hosting bill is required. The new PDF tools process files in the browser. A password-protected PDF is not bypassed: the tool directs an authorised user to the existing unlocker, then they choose the unlocked copy when they return.

The PDF compressor makes a lower-resolution flattened copy in order to target a chosen file size. It may not reach every target and removes selectable text and links; use the OCR-text action afterwards when a text extract is needed.

The dashboard opens `SBI.html` for the bank converter because the supplied file contains the converter while the current hosted URL is displaying only the logo. When deploying, keep `SBI.html` in the same folder as `index.html`.

## Adding a new workspace

Build each future tool as its own HTML page in this folder, then add a card to the `tools` grid in `index.html`. This avoids changing production tools while the dashboard grows.
