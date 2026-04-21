param(
  [Parameter(Mandatory = $true)]
  [string]$SourceFile,

  [Parameter(Mandatory = $true)]
  [string]$BuildSubdir,

  [string]$ExportPdf
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$sourcePath = (Resolve-Path (Join-Path $repoRoot $SourceFile)).Path
$sourceDir = Split-Path $sourcePath -Parent
$sourceName = Split-Path $sourcePath -Leaf
$buildDir = Join-Path $repoRoot ("gymflow/build/" + $BuildSubdir)

New-Item -ItemType Directory -Force $buildDir | Out-Null

Push-Location $sourceDir
try {
  & latexmk -pdf -interaction=nonstopmode -halt-on-error "-outdir=$buildDir" "-auxdir=$buildDir" $sourceName
}
finally {
  Pop-Location
}

$pdfName = [System.IO.Path]::GetFileNameWithoutExtension($sourceName) + '.pdf'
$builtPdf = Join-Path $buildDir $pdfName

if (-not (Test-Path $builtPdf)) {
  throw "No se generó el PDF esperado: $builtPdf"
}

if ($ExportPdf) {
  $exportPath = Join-Path $repoRoot $ExportPdf
  $exportDir = Split-Path $exportPath -Parent
  New-Item -ItemType Directory -Force $exportDir | Out-Null
  Copy-Item -Force $builtPdf $exportPath
}
