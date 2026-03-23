$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$archivePath = Join-Path (Split-Path -Parent $repoRoot) 'erkhet-site-deploy.tar.gz'

if (Test-Path $archivePath) {
  Remove-Item $archivePath -Force
}

$tarArgs = @(
  '-czf',
  $archivePath,
  '--exclude', '.git',
  '--exclude', '.env',
  '--exclude', 'apps/web/node_modules',
  '--exclude', 'apps/web/.next',
  '--exclude', 'apps/web/.turbo',
  '-C', $repoRoot,
  '.'
)

& tar.exe @tarArgs
if ($LASTEXITCODE -ne 0) {
  throw "tar.exe failed with exit code $LASTEXITCODE"
}

$archive = Get-Item $archivePath
Write-Host "Archive ready: $($archive.FullName)"
Write-Host "Size MB: $([math]::Round($archive.Length / 1MB, 2))"
