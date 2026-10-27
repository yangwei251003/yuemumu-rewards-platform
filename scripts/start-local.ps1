param([ValidateSet('a','b','integration')][string]$Profile='a')
$ErrorActionPreference='Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
function Invoke-Checked { param([string]$Program,[string[]]$Arguments) & $Program @Arguments; if($LASTEXITCODE -ne 0){throw "$Program failed: $LASTEXITCODE"} }
Invoke-Checked 'pnpm' @('install','--frozen-lockfile')
Invoke-Checked 'node' @('scripts/setup.mjs',$Profile)
Invoke-Checked 'pnpm' @('db:start')
Invoke-Checked 'pnpm' @('demo:stop')
Invoke-Checked 'pnpm' @('db:migrate')
Invoke-Checked 'pnpm' @('db:seed')
Invoke-Checked 'pnpm' @('build')
Invoke-Checked 'pnpm' @('demo')
Invoke-Checked 'pnpm' @('health')
