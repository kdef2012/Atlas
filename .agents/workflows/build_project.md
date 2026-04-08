---
description: How to install dependencies and build the Krown Academy Next.js app on a portable Node.js setup
---

### Set Execution Context
Ensure you are using the correct Node.js binary path and execution policies for this environment.
// turbo
```powershell
$env:PATH = "C:\Users\kdnelson\Downloads\node-v24.14.1-win-x64\node-v24.14.1-win-x64;" + $env:PATH
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

### Install Dependencies
Run npm install to pull down the project dependencies
// turbo
```powershell
npm install
```

### Build Project
Compile the Next.js optimization and build outputs
// turbo
```powershell
npm run build
```
