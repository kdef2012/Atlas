---
description: How to start the dev server and preview the Krown Academy Next.js Next.js app on a portable Node.js setup
---

### Set Execution Context
Ensure you are using the correct Node.js binary path and execution policies for this environment.
// turbo
```powershell
$env:PATH = "C:\Users\kdnelson\Downloads\node-v24.14.1-win-x64\node-v24.14.1-win-x64;" + $env:PATH
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

### Start Server
Run the Next.js dev server (default port is 9002 for this project).
```powershell
npm run dev
```

### Preview Instructions
Once the server is started, open your browser and navigate to http://localhost:9002 to test the application.
