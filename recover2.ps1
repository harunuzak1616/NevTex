$logPath = Join-Path $env:USERPROFILE ".gemini\antigravity\brain\e40d8b2c-9363-4bcf-b826-4feaf3a7c42d\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath -Encoding UTF8
$html = ""

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

if (-not [string]::IsNullOrEmpty($html)) {
    $outPath = Join-Path $env:USERPROFILE "Desktop\orijinal\tekstil\index.html"
    Set-Content $outPath -Value $html -Encoding UTF8
    Write-Host "Recovered HTML from subagent! Length: $($html.Length) saved to $outPath"
} else {
    Write-Host "Could not find HTML in subagent transcript."
}
