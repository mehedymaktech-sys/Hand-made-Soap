# Minimal static file server for the landing page (no dependencies)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()
Write-Host "Serving at http://localhost:8000/  (Ctrl+C to stop)"

$types = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".png"  = "image/png"
  ".webp" = "image/webp"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".json" = "application/json"
  ".txt"  = "text/plain; charset=utf-8"
}

$root = (Get-Location).Path

while ($listener.IsListening) {
  $ctx  = $listener.GetContext()
  $path = $ctx.Request.Url.AbsolutePath
  if ($path -eq "/") { $path = "/index.html" }

  $file = Join-Path $root ($path -replace "/", "\")
  $file = [System.IO.Path]::GetFullPath($file)

  # basic path safety: stay inside project root
  if (-not $file.StartsWith($root)) {
    $ctx.Response.StatusCode = 403; $ctx.Response.Close(); continue
  }

  if (Test-Path $file -PathType Leaf) {
    $ext  = [System.IO.Path]::GetExtension($file).ToLower()
    $mime = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $ctx.Response.ContentType = $mime
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $ctx.Response.StatusCode = 404
    $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - Not found")
    $ctx.Response.ContentLength64 = $msg.Length
    $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
  }
  $ctx.Response.Close()
}