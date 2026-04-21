param()

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$gymflowDir = Join-Path $repoRoot 'gymflow'

$patterns = @('*.aux', '*.bbl', '*.bcf', '*.blg', '*.fdb_latexmk', '*.fls', '*.lof', '*.log', '*.lot', '*.out', '*.run.xml', '*.synctex.gz', '*.toc', '*.pdf')
$keepPdfDirs = @(
  (Join-Path $repoRoot 'output\pdf'),
  (Join-Path $gymflowDir 'layouts')
)

Get-ChildItem -Path $gymflowDir -Recurse -File | Where-Object {
  $matchesPattern = $false
  foreach ($pattern in $patterns) {
    if ($_.Name -like $pattern) {
      $matchesPattern = $true
      break
    }
  }

  if (-not $matchesPattern) { return $false }

  foreach ($keepDir in $keepPdfDirs) {
    if ($_.FullName.StartsWith($keepDir, [System.StringComparison]::OrdinalIgnoreCase)) {
      return $false
    }
  }

  return $true
} | Remove-Item -Force
