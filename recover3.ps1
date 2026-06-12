$logPath = Join-Path $env:USERPROFILE ".gemini\antigravity\brain\f04a29b5-6574-4114-a4c9-837a06b9abfe\.system_generated\logs\transcript.jsonl"
$lines = [System.IO.File]::ReadAllLines($logPath)
$html = ""

foreach ($line in $lines) {
    if ($line -match '"type":"USER_EDIT"') {
        try {
            $json = $line | ConvertFrom-Json
            if ($json.content -match "<html" -and $json.content -match "Nev Tex Pro") {
                $html = $json.content
            }
        } catch {}
    }
}

if ($html.Length -gt 1000) {
    [System.IO.File]::WriteAllText("c:\Users\İş\Desktop\orijinal\tekstil\index.html", $html, [System.Text.Encoding]::UTF8)
    Write-Host "Success: recovered length $($html.Length)"
} else {
    Write-Host "Not found in USER_EDIT"
}
