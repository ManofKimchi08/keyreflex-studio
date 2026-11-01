$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut('C:\Users\dlwjd\Desktop\KeyReflex Studio.lnk')
$sc.TargetPath = 'C:\Users\dlwjd\.gemini\antigravity\scratch\typing-reflex-trainer\KeyReflex.exe'
$sc.WorkingDirectory = 'C:\Users\dlwjd\.gemini\antigravity\scratch\typing-reflex-trainer'
$sc.Description = 'KeyReflex Studio - 키보드 반응속도 측정 & 타자 연습'
$sc.Save()
Write-Host 'Desktop Shortcut Created Successfully!'
