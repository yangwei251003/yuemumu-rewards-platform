$ErrorActionPreference='Stop'
& (Join-Path $PSScriptRoot 'start-local.ps1') -Profile integration
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& pnpm demo:open
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
