<#
.SYNOPSIS
  Renders a site template tile thumbnail (585x500 PNG) from an HTML mock-up with headless Edge.

.EXAMPLE
  powershell -File render-thumbnail.ps1 -Html examples\kit-nextjs-acme\scripts\assets\site-template-thumbnail.html

  Writes site-template-thumbnail.png next to the HTML file. The page is laid out at 1170x1000
  and captured at half scale, which keeps the serialized media blob around 200 KB.
#>
param(
    [Parameter(Mandatory = $true)][string]$Html,
    [string]$Out
)

$htmlPath = (Resolve-Path $Html).Path
if (-not $Out) { $Out = [System.IO.Path]::ChangeExtension($htmlPath, '.png') }
$outPath = [System.IO.Path]::GetFullPath($Out)

$edge = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'Neither Microsoft Edge nor Google Chrome was found.' }

$profileDir = Join-Path $env:TEMP 'site-thumbnail-browser-profile'
$arguments = @(
    '--headless=new', '--hide-scrollbars', '--disable-gpu',
    '--force-device-scale-factor=0.5', '--window-size=1170,1000',
    "--screenshot=$outPath", "--user-data-dir=$profileDir",
    "file:///$($htmlPath -replace '\\', '/')"
)
Start-Process -FilePath $edge -ArgumentList $arguments -Wait | Out-Null
if (-not (Test-Path $outPath)) { throw "No screenshot was written to $outPath" }
"{0} ({1:N0} KB)" -f $outPath, ((Get-Item $outPath).Length / 1KB)
