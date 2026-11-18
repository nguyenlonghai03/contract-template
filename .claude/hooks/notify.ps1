# Windows toast notification for Claude Code hooks.
param([string]$Message = "Claude Code cần bạn")
$null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
$null = [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime]
$text = [System.Security.SecurityElement]::Escape($Message)
$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml("<toast><visual><binding template=`"ToastGeneric`"><text>Claude Code</text><text>$text</text></binding></visual><audio src=`"ms-winsoundevent:Notification.Default`"/></toast>")
$appId = "{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe"
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show([Windows.UI.Notifications.ToastNotification]::new($xml))
