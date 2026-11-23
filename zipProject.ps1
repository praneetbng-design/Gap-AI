$ProgressPreference = 'SilentlyContinue'
$src = "C:\Users\prane\.gemini\antigravity\scratch\GAP-AI"
$dest = "C:\Users\prane\.gemini\antigravity\scratch\GAP-AI.zip"
$stageParent = "C:\Users\prane\.gemini\antigravity\scratch\GAP-AI-Stage"
$stage = "$stageParent\GAP-AI"

if (Test-Path $stageParent) { Remove-Item -Recurse -Force $stageParent }
if (Test-Path $dest) { Remove-Item -Force $dest }

New-Item -ItemType Directory -Force -Path $stage | Out-Null
robocopy $src $stage /E /XD node_modules .git

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($stageParent, $dest, [System.IO.Compression.CompressionLevel]::Optimal, $false)

Remove-Item -Recurse -Force $stageParent
Write-Host "ZIP created successfully with GAP-AI root folder at $dest"
