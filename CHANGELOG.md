## [1.2.1](https://github.com/jhderojasUVa/randomfuckwork/compare/v1.2.0...v1.2.1) (2026-09-06)

### 🐛 Bug Fixes

* **ci:** write test results JSON via stdout redirect ([ae08b2a](https://github.com/jhderojasUVa/randomfuckwork/commit/ae08b2a63c7e4e9f216a74de3d9a48e2ffa917ac))

## [1.2.0](https://github.com/jhderojasUVa/randomfuckwork/compare/v1.1.0...v1.2.0) (2026-09-06)

### ✨ Features

* Add automated setup scripts for complete pipeline activation ([6873ada](https://github.com/jhderojasUVa/randomfuckwork/commit/6873adab1a89093c72ecb5196233ff2e2dd4823e))
* Add automated setup scripts for GCP integration ([0ec6aed](https://github.com/jhderojasUVa/randomfuckwork/commit/0ec6aede071b3effc5250db4517da8a39d7e1fcb))
* add comprehensive tests for refactored components and services ([8bf92ee](https://github.com/jhderojasUVa/randomfuckwork/commit/8bf92eea38dbda00c7fd5f7c41e2e4b9fec86da9))
* Add GitHub Actions CI/CD pipeline for testing and GCP publishing ([ed04a23](https://github.com/jhderojasUVa/randomfuckwork/commit/ed04a237ffa60ce011026defc16a8d65d03ed24c))
* change public name ([84fe1e0](https://github.com/jhderojasUVa/randomfuckwork/commit/84fe1e01e0bc7f65be19a2168f2425eee5024f7c))
* complete TypeScript migration and add comprehensive tests ([11d82d2](https://github.com/jhderojasUVa/randomfuckwork/commit/11d82d2b2735c4f4c25e12468df2c8ffd7bd35f7))
* **deps:** update semantic-release and fix dependency conflicts ([5490b0a](https://github.com/jhderojasUVa/randomfuckwork/commit/5490b0a4d286333342a25333d1748e30e5f9b412))
* **husky:** added husky ([78b9ef6](https://github.com/jhderojasUVa/randomfuckwork/commit/78b9ef690b599116505f070592e24b15c978e084))
* lint ([9a728dc](https://github.com/jhderojasUVa/randomfuckwork/commit/9a728dc333d1ee5054b7d678e61f3f00d09a8b2c))
* **react:** migrate to React 19 with createRoot API and improve code quality ([815c9aa](https://github.com/jhderojasUVa/randomfuckwork/commit/815c9aa38b8f1c88931c1e230f1782b194142a98))
* **react:** upgrade to React 19.2.8 with compatible testing libraries ([f6d6cb7](https://github.com/jhderojasUVa/randomfuckwork/commit/f6d6cb769b7fcc48c6222e4bd4435f2e1cce1ed9))

### 🐛 Bug Fixes

* Add final bulletproof setup script with clear steps ([991dec4](https://github.com/jhderojasUVa/randomfuckwork/commit/991dec49f115a81cf605d5986f50543aae8eec9e))
* Add WIF provider recovery script for corrupted state ([f5afddc](https://github.com/jhderojasUVa/randomfuckwork/commit/f5afddc0bba342f56631cb914126a7dbaa0375dd))
* Auto-detect and fix old provider configuration in setup script ([7afa09e](https://github.com/jhderojasUVa/randomfuckwork/commit/7afa09ed214b983aa9569223383dc04bb508737f))
* **ci:** add missing semantic-release plugin dependencies ([3a37ff2](https://github.com/jhderojasUVa/randomfuckwork/commit/3a37ff2f31719bc046bc16e4b1b4bfa5bde89635))
* **ci:** correct release workflow branch trigger to master ([acee167](https://github.com/jhderojasUVa/randomfuckwork/commit/acee167e08b50ae0c1744814427afc3c3e1a05fc))
* **ci:** pin Node.js to 22.19.0 for semantic-release ([370e323](https://github.com/jhderojasUVa/randomfuckwork/commit/370e323bfda86fb5062a594db0ec16222e8bdcf0))
* **ci:** remove problematic JUnit XML generation step ([04d07dc](https://github.com/jhderojasUVa/randomfuckwork/commit/04d07dced129fe1c7af219f01934aa37eee60a40))
* **ci:** update publish-to-gcp condition to use master branch ([d090620](https://github.com/jhderojasUVa/randomfuckwork/commit/d09062015bed3caeec08bf0e0ed966214e6f310e))
* **ci:** upgrade Node.js from 18 to 22 ([57cd2d6](https://github.com/jhderojasUVa/randomfuckwork/commit/57cd2d6cf7cec465372561930ee6e9f80fe6719d))
* **ci:** use RELEASE_TOKEN PAT for semantic-release push ([6e04f42](https://github.com/jhderojasUVa/randomfuckwork/commit/6e04f4291152b8b1774f260ce7f5dc193d5f4f7e))
* Correct GitHub OIDC attribute-mapping in WIF provider creation ([8979cb5](https://github.com/jhderojasUVa/randomfuckwork/commit/8979cb55be7c0e67e41a75ec000493bd9e65322a))
* Correct script bugs in RECOVER_WIF_PROVIDER.sh ([2110486](https://github.com/jhderojasUVa/randomfuckwork/commit/2110486cc246b2bc10bfee835c45ac2771620f9a))
* Create corrected setup script with proper gcloud syntax ([4cf029d](https://github.com/jhderojasUVa/randomfuckwork/commit/4cf029d9982a31564f3db300ae3f340be48b238a))
* **eslint:** remove conflicting linting rules permanently ([27ad11e](https://github.com/jhderojasUVa/randomfuckwork/commit/27ad11ecbff767840fae49b618e005679c2fe566))
* lint-staged added ([a376141](https://github.com/jhderojasUVa/randomfuckwork/commit/a376141fa85a4d40c52d6e40edeaa11332719290))
* resolve test suite failures blocking release pipeline ([fe48739](https://github.com/jhderojasUVa/randomfuckwork/commit/fe48739689b16b15c9cd037109cf4f55d9fbeae1))
* Simplify attribute-mapping to minimal required configuration ([17967c8](https://github.com/jhderojasUVa/randomfuckwork/commit/17967c807fd3a453b4e1121212d854131eee7da2))

### ♻️ Refactoring

* divide monolithic App.tsx into reusable components and services ([a84d5db](https://github.com/jhderojasUVa/randomfuckwork/commit/a84d5dbbca9ea8852e73af3e19bde0a81cfef42b))

### 📚 Documentation

* Add activation checklist and final summary ([d700ee0](https://github.com/jhderojasUVa/randomfuckwork/commit/d700ee00acb9e47b10b36f47c7d24a8cc887d3d8))
* Add CI/CD pipeline setup instructions to README ([42510c5](https://github.com/jhderojasUVa/randomfuckwork/commit/42510c5dea1bc55483dbba1d3b21eb0e7d1e2d94))
* Add complete reset script for clean GCP setup ([9b2373e](https://github.com/jhderojasUVa/randomfuckwork/commit/9b2373e9477c77c710bc0c4c5aadcd9457636c3f))
* Add comprehensive end-to-end setup guide ([61a17fb](https://github.com/jhderojasUVa/randomfuckwork/commit/61a17fbfe7114b1d5093dfa5a5e9012f385c1786))
* Add comprehensive file index and navigation guide ([130f72d](https://github.com/jhderojasUVa/randomfuckwork/commit/130f72d21baf0bface36aff0d119f849238661b1))
* Add comprehensive getting-started guide for pipeline setup ([0b5bfc3](https://github.com/jhderojasUVa/randomfuckwork/commit/0b5bfc36e18512500a9d02bbdfd4f53d6674003f))
* add comprehensive refactoring summary ([583242d](https://github.com/jhderojasUVa/randomfuckwork/commit/583242d8a1dad5de3f121d652c1671da2afd694b))
* add comprehensive release workflow documentation ([f33b820](https://github.com/jhderojasUVa/randomfuckwork/commit/f33b820a9bee706493d9d4b36f0bf3b416b16108))
* Add comprehensive troubleshooting test script ([89ef54b](https://github.com/jhderojasUVa/randomfuckwork/commit/89ef54b4ce6842461601ab19a9abd631889f3738))
* Add FINAL_STATUS.txt comprehensive completion guide ([eef2528](https://github.com/jhderojasUVa/randomfuckwork/commit/eef2528f268eb065d53d814a6f1e06119f536cc2))
* Add immediate fix guide for provider error ([289fa76](https://github.com/jhderojasUVa/randomfuckwork/commit/289fa762c9148163fbfaac677d46c2d4978b9144))
* Add IMMEDIATE_ACTION.txt for user's current error state ([d9f88d7](https://github.com/jhderojasUVa/randomfuckwork/commit/d9f88d71690211620b1c14ec3a5672d6ae95b2e6))
* Add manual step-by-step setup script as fallback ([34e85de](https://github.com/jhderojasUVa/randomfuckwork/commit/34e85de78627e93aedf3c5b9a109d1d6c39a7b78))
* Add quick start reference card for pipeline setup ([2d1b82b](https://github.com/jhderojasUVa/randomfuckwork/commit/2d1b82b90eec5541054faa89c3a6e7b0a1ab2c41))
* Add recovery script option for WIF provider errors ([1325f07](https://github.com/jhderojasUVa/randomfuckwork/commit/1325f076bea8a2008b9fbcf089b083c7d9ef8152))
* add release implementation completion summary ([49779ce](https://github.com/jhderojasUVa/randomfuckwork/commit/49779ce775f3721262f1194f466d166327d517cf))
* Add RUN_THIS_NOW.txt - final solution guide ([0544775](https://github.com/jhderojasUVa/randomfuckwork/commit/054477589a97bd61bfa4f7f497770bf544d13033))
* Add setup summary and next steps guide ([fdae59d](https://github.com/jhderojasUVa/randomfuckwork/commit/fdae59d158698c94d9b0dd4755f16e9a2cf2ebfe))
* Add setup validation script and final complete setup guide ([726100e](https://github.com/jhderojasUVa/randomfuckwork/commit/726100ee608b33563270b970fdee3163fefa387f))
* Add specific fix guide for INVALID_ARGUMENT error ([6bfa5c6](https://github.com/jhderojasUVa/randomfuckwork/commit/6bfa5c6f914d2eacc60e7ff8c763f0cbc20a3c3f))
* Add START_HERE.md - immediate action items for user ([e9ad9d4](https://github.com/jhderojasUVa/randomfuckwork/commit/e9ad9d494f980042b33202097a6ff3bdeff7fd31))
* add TypeScript migration summary ([37db2d2](https://github.com/jhderojasUVa/randomfuckwork/commit/37db2d2d06acdc9568c184c57a41833b21349734))
* Add urgent action file for INVALID_ARGUMENT error ([a8d9d8d](https://github.com/jhderojasUVa/randomfuckwork/commit/a8d9d8d7cfde0c4a34a1ec4df1a76d3fe01e52d0))
* Add WSL pre-flight checker and quick start guide ([006dc64](https://github.com/jhderojasUVa/randomfuckwork/commit/006dc64e2e513d09ac5cb97fabcbdeb0523a2cd3))
* Add WSL-specific setup guide and update getting started ([18d3e5e](https://github.com/jhderojasUVa/randomfuckwork/commit/18d3e5e25eee572cd3f756be3b529eceea483838))
* Update INDEX.md with WSL guides ([1000855](https://github.com/jhderojasUVa/randomfuckwork/commit/1000855976de3ee7a6e04a1a7e3b32319c3ac89d))
* Update START_HERE to use new master setup script ([6c2b34f](https://github.com/jhderojasUVa/randomfuckwork/commit/6c2b34fbfcf50917ef30cdd5fbe7f0c867a36867))

### 🔧 Chores

* **ci:** complete workflow consolidation - remove duplicate release.yml ([eb6adbf](https://github.com/jhderojasUVa/randomfuckwork/commit/eb6adbf2742bc4aaa68cd39f8333e2e739d32ea1))
* Clean up old scripts, add simple set-github-vars script ([b9206d7](https://github.com/jhderojasUVa/randomfuckwork/commit/b9206d7b467e9d211881228f70c70bba90af8a3f))
* complete TypeScript migration with types and constants ([333af48](https://github.com/jhderojasUVa/randomfuckwork/commit/333af48867a8f7f1e800d3c12f00e52040102d95))
* remove backup test file ([5f89189](https://github.com/jhderojasUVa/randomfuckwork/commit/5f89189596031bee01b6894d3581c24c017a2ba7))
* remove unused import from test file ([1ede745](https://github.com/jhderojasUVa/randomfuckwork/commit/1ede7453dd2aaf12f418520f5f971de3f443fac5))
* **security:** update eslint, prettier, and other dev dependencies ([dded2fe](https://github.com/jhderojasUVa/randomfuckwork/commit/dded2fea4327c84592ac3441a2d8868a3b62c75b))
* Simplify setup - one script, one instruction file ([4c1851d](https://github.com/jhderojasUVa/randomfuckwork/commit/4c1851d17e16d8c4c1a46dfb500d5135069878e1))
* update vscode settings ([b372c68](https://github.com/jhderojasUVa/randomfuckwork/commit/b372c689fbb87922306138fda4a4565a3836b8b2))

### 🚀 CI/CD

* add semantic release workflow for version management ([2664266](https://github.com/jhderojasUVa/randomfuckwork/commit/2664266b66b7fb4fc4b981d44288ab9a3195d23c))
* capture semantic-release output to file and upload on failure ([c47cc9e](https://github.com/jhderojasUVa/randomfuckwork/commit/c47cc9e44ef39a08628bd31686eb8112522b6ca0))
* update workflow triggers to use master branch ([6b1315b](https://github.com/jhderojasUVa/randomfuckwork/commit/6b1315bc413fe72b3973f8f98f84fbebe3f65142))
* upload to google cloud ([2e63cbd](https://github.com/jhderojasUVa/randomfuckwork/commit/2e63cbd209be3f2eb90ebb0ef1aeb2d349f118db))
