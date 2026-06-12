$logPath = Join-Path $env:USERPROFILE ".gemini\antigravity\brain\f04a29b5-6574-4114-a4c9-837a06b9abfe\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath -Encoding UTF8
$html = ""

foreach ($line in $lines) {
    if ($line -match '"type":"USER_EDIT"') {
        try {
            $json = $line | ConvertFrom-Json
            if ($json.content -match "<html") {
                $html = $json.content
            }
        } catch {}
    }
}

if ([string]::IsNullOrEmpty($html)) {
    foreach ($line in $lines) {
        if ($line -match 'write_to_file' -and $line -match 'index.html') {
            try {
                $json = $line | ConvertFrom-Json
                foreach ($tool in $json.tool_calls) {
                    if ($tool.name -eq 'write_to_file' -and $tool.args.TargetFile -match 'index.html') {
                        $html = $tool.args.CodeContent
                    }
                }
            } catch {}
        }
    }
}

if (-not [string]::IsNullOrEmpty($html)) {
    $outPath = Join-Path $env:USERPROFILE "Desktop\orijinal\tekstil\index.html"
    Set-Content $outPath -Value $html -Encoding UTF8
    Write-Host "Recovered HTML length: $($html.Length) saved to $outPath"
} else {
    Write-Host "Could not find HTML in transcript."
}
