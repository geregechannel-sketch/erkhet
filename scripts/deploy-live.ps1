$ErrorActionPreference = "Stop"

param(
  [string]$HostAlias = "erkhet-live",
  [string]$RemoteArchive = "/root/erkhet-site-deploy.tar.gz",
  [string]$RemoteRoot = "/root/erkhet-site"
)

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
$archivePath = Join-Path (Split-Path -Parent $repoRoot) "erkhet-site-deploy.tar.gz"

& (Join-Path $scriptRoot "make-deploy-archive.ps1")

if (-not (Test-Path $archivePath)) {
  throw "Deploy archive not found at $archivePath"
}

Write-Host "Uploading archive to $HostAlias..."
& scp.exe $archivePath "${HostAlias}:/root/"
if ($LASTEXITCODE -ne 0) {
  throw "scp failed with exit code $LASTEXITCODE"
}

$remoteCommands = @(
  "set -e"
  "mkdir -p $RemoteRoot"
  "tar -xzf $RemoteArchive -C $RemoteRoot"
  "cd $RemoteRoot"
  "docker compose -f docker-compose.prod.yml up --build -d"
  "docker compose -f docker-compose.prod.yml ps"
) -join "; "

Write-Host "Deploying on $HostAlias..."
& ssh.exe $HostAlias $remoteCommands
if ($LASTEXITCODE -ne 0) {
  throw "ssh deploy failed with exit code $LASTEXITCODE"
}

Write-Host "Live deploy completed."
