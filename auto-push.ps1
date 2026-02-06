# Auto-Push Script for BudgetChain App
# This script watches for file changes and automatically commits & pushes to GitHub

$folder = "f:\Documents\budgetchain-app"
$branch = "main"  # Change this if you use a different branch

# No debounce - push immediately on every change

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $folder
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Exclude certain files/folders from triggering pushes
$excludePatterns = @("\.git", "node_modules", "\.ps1$", "package-lock\.json")

function Push-Changes {
    param($changeType, $filePath)
    
    # Check if file should be excluded
    foreach ($pattern in $excludePatterns) {
        if ($filePath -match $pattern) {
            return
        }
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "`n[$timestamp] Detected $changeType`: $filePath" -ForegroundColor Cyan
    
    Set-Location $folder
    
    # Stage all changes
    git add .
    
    # Check if there are changes to commit
    $status = git status --porcelain
    if ($status) {
        $commitMsg = "Auto-commit: $changeType at $timestamp"
        git commit -m $commitMsg
        
        Write-Host "Pushing to GitHub..." -ForegroundColor Green
        git push origin $branch
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
        }
        else {
            Write-Host "Push failed! Check your connection or credentials." -ForegroundColor Red
        }
    }
    else {
        Write-Host "No changes to commit." -ForegroundColor Yellow
    }
}

# Register event handlers
$changeAction = {
    Push-Changes "Changed" $Event.SourceEventArgs.FullPath
}

$createAction = {
    Push-Changes "Created" $Event.SourceEventArgs.FullPath
}

$deleteAction = {
    Push-Changes "Deleted" $Event.SourceEventArgs.FullPath
}

Register-ObjectEvent $watcher "Changed" -Action $changeAction | Out-Null
Register-ObjectEvent $watcher "Created" -Action $createAction | Out-Null
Register-ObjectEvent $watcher "Deleted" -Action $deleteAction | Out-Null

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  Auto-Push Watcher Started!" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Watching: $folder" -ForegroundColor White
Write-Host "Branch: $branch" -ForegroundColor White
Write-Host "Mode: Instant push on every change" -ForegroundColor Green
Write-Host "`nPress Ctrl+C to stop watching.`n" -ForegroundColor Yellow

# Keep the script running
try {
    while ($true) { 
        Start-Sleep -Seconds 1 
    }
}
finally {
    # Cleanup when script stops
    Get-EventSubscriber | Unregister-Event
    $watcher.Dispose()
    Write-Host "`nWatcher stopped." -ForegroundColor Red
}
