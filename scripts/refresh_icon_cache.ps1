$WshShell = New-Object -ComObject WScript.Shell

# 1. Create Start Menu Shortcuts for "The Pill", "Pill", and "pill"
$startMenuDir = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs'

$shortcutNames = @('The Pill.lnk', 'Pill.lnk', 'pill.lnk')
foreach ($name in $shortcutNames) {
    $shortcutPath = Join-Path $startMenuDir $name
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = 'D:\Pill\Pill.exe'
    $Shortcut.WorkingDirectory = 'D:\Pill'
    $Shortcut.IconLocation = 'D:\Pill\Pill.exe,0'
    $Shortcut.Description = 'The Pill for Windows 11 - Fluid Dynamic Island & AI Assistant'
    $Shortcut.Save()
    Write-Output "Shortcut saved to $shortcutPath"
}

# 2. Register Windows App Paths in HKCU so Windows Search & Run commands prioritize Pill.exe
$appPaths = @(
    'HKCU:\Software\Microsoft\Windows\CurrentVersion\App Paths\pill.exe',
    'HKCU:\Software\Microsoft\Windows\CurrentVersion\App Paths\Pill.exe'
)
foreach ($regPath in $appPaths) {
    if (-not (Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    Set-ItemProperty -Path $regPath -Name '(Default)' -Value 'D:\Pill\Pill.exe'
    Set-ItemProperty -Path $regPath -Name 'Path' -Value 'D:\Pill'
    Write-Output "Registered App Path at $regPath"
}

# 3. Clear Windows Explorer Icon Cache Database
Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 800

$iconCacheLocal = Join-Path $env:LOCALAPPDATA 'IconCache.db'
if (Test-Path $iconCacheLocal) {
    Remove-Item -Force $iconCacheLocal -ErrorAction SilentlyContinue
    Write-Output "Removed $iconCacheLocal"
}

$explorerCacheDir = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Explorer'
if (Test-Path $explorerCacheDir) {
    Get-ChildItem -Path $explorerCacheDir -Filter 'iconcache_*.db' | ForEach-Object {
        Remove-Item -Force $_.FullName -ErrorAction SilentlyContinue
        Write-Output "Removed $($_.FullName)"
    }
}

Start-Process explorer.exe
Start-Sleep -Milliseconds 1200

# 4. Dispatch SHChangeNotify shell notification
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class ShellNotifier {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@
[ShellNotifier]::SHChangeNotify(0x08000000, 0x0000, [IntPtr]::Zero, [IntPtr]::Zero)
Write-Output "Shell notification sent. Windows icon cache successfully refreshed!"
