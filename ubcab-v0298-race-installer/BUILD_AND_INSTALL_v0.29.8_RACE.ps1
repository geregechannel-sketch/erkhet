$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Log = Join-Path $Root 'BUILD_INSTALL_v0.29.8_RACE.log'
$Work = Join-Path $Root '.work298'
$Tools = Join-Path $Root '.tools298'
$OutApk = Join-Path $Root 'UBCabOrderHelper-v0.29.8-RACE.apk'
$PatchedZip = Join-Path $Root 'UBCabOrderHelper-source-v0.29.8-RACE-PATCHED.zip'

function Log([string]$s) {
  $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff')  $s"
  Write-Host $line
  Add-Content -Path $Log -Value $line -Encoding UTF8
}
function Replace-Required([string]$body,[string]$old,[string]$new,[string]$label) {
  if (-not $body.Contains($old)) { throw "PATCH FAIL [$label]: expected source text not found: $old" }
  return $body.Replace($old,$new)
}
function Download([string]$url,[string]$out) {
  if (Test-Path $out) { return }
  Log "Downloading $url"
  Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
}

Set-Content -Path $Log -Value 'UBCab v0.29.8 RACE build/install log' -Encoding UTF8
New-Item -ItemType Directory -Force -Path $Tools | Out-Null

# Locate the v0.29.7 FULL source archive. If it is not beside this script, open a file picker.
$SourceZip = Join-Path $Root 'UBCabOrderHelper-source-v0.29.7-FULL.zip'
if (-not (Test-Path $SourceZip)) {
  Add-Type -AssemblyName System.Windows.Forms
  $dlg = New-Object System.Windows.Forms.OpenFileDialog
  $dlg.Title = 'Select UBCabOrderHelper-source-v0.29.7-FULL.zip'
  $dlg.Filter = 'ZIP files (*.zip)|*.zip|All files (*.*)|*.*'
  if ($dlg.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) { throw 'Source ZIP selection cancelled.' }
  $SourceZip = $dlg.FileName
}
Log "Source ZIP: $SourceZip"

# Extract full source.
Remove-Item $Work -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $Work | Out-Null
Expand-Archive -Path $SourceZip -DestinationPath $Work -Force
$Project = Get-ChildItem $Work -Directory | Select-Object -First 1
if (-not $Project) { throw 'Source archive did not contain an Android project.' }
$Project = $Project.FullName
Log "Project: $Project"

$Svc = Join-Path $Project 'app\src\main\java\com\local\ubcabassistant\v10\UbcabAccessibilityService.kt'
$Prefs = Join-Path $Project 'app\src\main\java\com\local\ubcabassistant\Prefs.kt'
$Main = Join-Path $Project 'app\src\main\java\com\local\ubcabassistant\v10\MainActivity.kt'
$Policy = Join-Path $Project 'app\src\main\java\com\local\ubcabassistant\ScheduledOrderSafetyPolicy.kt'
$Gradle = Join-Path $Project 'app\build.gradle.kts'
$A11yXml = Join-Path $Project 'app\src\main\res\xml\accessibility_service_config.xml'
if (-not (Test-Path $A11yXml)) { $A11yXml = Join-Path $Project 'app\src\main\res\xml\accessibility_service.xml' }
foreach ($p in @($Svc,$Prefs,$Main,$Policy,$Gradle)) { if (-not (Test-Path $p)) { throw "Missing required full-source file: $p" } }

# Verify the full v0.29.7 lineage before patching. This deliberately refuses the small v0.29.6 Turbo test project.
$svcText = Get-Content $Svc -Raw -Encoding UTF8
$prefsText = Get-Content $Prefs -Raw -Encoding UTF8
$mainText = Get-Content $Main -Raw -Encoding UTF8
$policyText = Get-Content $Policy -Raw -Encoding UTF8
$gradleText = Get-Content $Gradle -Raw -Encoding UTF8
$fullMarkers = @(
  'ReminderNotificationListenerService',
  'MULTI_ORDER_SKIP_XL',
  'ORDINARY_PRIORITY',
  'FAST_CONFIRM_TEXT_RETRY_DELAYS_MS',
  'INTERLEAVED_ACCEPT_PROBE_DELAYS_MS'
)
foreach ($m in $fullMarkers) {
  $all = $svcText + "`n" + $mainText + "`n" + $prefsText
  if (-not $all.Contains($m)) { throw "FULL SOURCE AUDIT FAIL: marker '$m' missing. Do not use the small Turbo test source." }
}
if (-not $policyText.Contains('FIRST_DAY(0L)') -or -not $policyText.Contains('NEXT_DAY(1L)')) {
  throw 'DATE MODE AUDIT FAIL: FIRST_DAY/NEXT_DAY support is missing.'
}
if ($policyText.Contains('isNextDayOnlyWindow')) { throw 'DATE MODE AUDIT FAIL: obsolete automatic 20:00 cutover is still present.' }
Log 'Full-source/date-mode preflight: PASS'

# ---- v0.29.8 RACE patch ----
$gradleText = Replace-Required $gradleText 'versionCode = 297' 'versionCode = 298' 'versionCode'
$gradleText = Replace-Required $gradleText 'versionName = "0.29.7"' 'versionName = "0.29.8"' 'versionName'
Set-Content $Gradle $gradleText -Encoding UTF8

$svcText = Replace-Required $svcText 'private fun singleDayRapidRefreshSlotMs(): Long = 500L' @'
private fun singleDayRapidRefreshSlotMs(): Long = when (Prefs.speedProfile(this).id) {
        "galaxy_s25" -> 300L
        "tab_a11" -> 420L
        "generic_fast" -> 350L
        else -> 500L
    }
'@ 'device adaptive refresh cadence'
$svcText = Replace-Required $svcText 'private val INTERLEAVED_ACCEPT_PROBE_DELAYS_MS = longArrayOf(20L, 45L, 80L)' 'private val INTERLEAVED_ACCEPT_PROBE_DELAYS_MS = longArrayOf(10L, 25L, 45L)' 'probe delays'
$svcText = Replace-Required $svcText 'private val FAST_CONFIRM_TEXT_RETRY_DELAYS_MS = longArrayOf(20L, 35L, 60L, 100L, 160L)' 'private val FAST_CONFIRM_TEXT_RETRY_DELAYS_MS = longArrayOf(0L, 15L, 30L, 55L, 90L)' 'confirm retries'
$svcText = Replace-Required $svcText 'private const val FAST_ACCEPT_CLICK_COOLDOWN_MS = 120L' 'private const val FAST_ACCEPT_CLICK_COOLDOWN_MS = 60L' 'fast accept cooldown'
$svcText = Replace-Required $svcText 'private const val ACCEPT_ACTION_DEBOUNCE_MS = 120L' 'private const val ACCEPT_ACTION_DEBOUNCE_MS = 60L' 'accept debounce'
$svcText = Replace-Required $svcText 'private const val TAKE_CONFIRM_FAST_RETRY_MS = 40L' 'private const val TAKE_CONFIRM_FAST_RETRY_MS = 15L' 'take confirm retry'
$svcText = Replace-Required $svcText 'private const val REFRESH_RETRY_AFTER_MS = 300L' 'private const val REFRESH_RETRY_AFTER_MS = 160L' 'refresh retry'
$svcText = Replace-Required $svcText 'private const val SINGLE_DAY_REFRESH_POST_CLICK_SETTLE_MS = 90L' 'private const val SINGLE_DAY_REFRESH_POST_CLICK_SETTLE_MS = 45L' 'post click settle'
$svcText = Replace-Required $svcText 'private const val SINGLE_DAY_REFRESH_MIN_OBSERVE_MS = 180L' 'private const val SINGLE_DAY_REFRESH_MIN_OBSERVE_MS = 70L' 'minimum observe'
$svcText = $svcText.Replace('v0.29.7','v0.29.8').Replace('v0.29.6','v0.29.8')
Set-Content $Svc $svcText -Encoding UTF8

# Lower accessibility event batching when the XML exposes notificationTimeout=100.
if (Test-Path $A11yXml) {
  $x = Get-Content $A11yXml -Raw -Encoding UTF8
  if ($x.Contains('android:notificationTimeout="100"')) {
    $x = $x.Replace('android:notificationTimeout="100"','android:notificationTimeout="25"')
    Set-Content $A11yXml $x -Encoding UTF8
  }
}

# Update visible version strings without changing the date-mode wording.
Get-ChildItem (Join-Path $Project 'app\src\main') -Recurse -File -Include *.kt,*.xml | ForEach-Object {
  $b = Get-Content $_.FullName -Raw -Encoding UTF8
  $n = $b.Replace('v0.29.7','v0.29.8')
  if ($n -ne $b) { Set-Content $_.FullName $n -Encoding UTF8 }
}

# Post-patch audit. The RACE build must keep manual FIRST/NEXT day selection and semantic-only Refresh strategy.
$svcText = Get-Content $Svc -Raw -Encoding UTF8
$policyText = Get-Content $Policy -Raw -Encoding UTF8
$prefsText = Get-Content $Prefs -Raw -Encoding UTF8
$mainText = Get-Content $Main -Raw -Encoding UTF8
$checks = [ordered]@{
  'version 298' = ((Get-Content $Gradle -Raw -Encoding UTF8).Contains('versionCode = 298'))
  'FIRST_DAY' = $policyText.Contains('FIRST_DAY(0L)')
  'NEXT_DAY' = $policyText.Contains('NEXT_DAY(1L)')
  'no automatic 20:00 cutover' = (-not $policyText.Contains('isNextDayOnlyWindow'))
  'persistent date choice' = $prefsText.Contains('KEY_SCAN_DATE_MODE')
  'date choice UI' = $mainText.Contains('ӨДӨР СОНГОЛТ')
  'semantic only refresh order' = $svcText.Contains('buildRefreshStrategyOrder(): List<String> = listOf(REFRESH_STRATEGY_SEMANTIC)')
  'S25 300ms' = $svcText.Contains('"galaxy_s25" -> 300L')
  'Tab 420ms' = $svcText.Contains('"tab_a11" -> 420L')
  'probe 10/25/45' = $svcText.Contains('longArrayOf(10L, 25L, 45L)')
  'confirm 0/15/30/55/90' = $svcText.Contains('longArrayOf(0L, 15L, 30L, 55L, 90L)')
  'ordinary priority preserved' = $svcText.Contains('ORDINARY_PRIORITY')
  'multi XL skip preserved' = $svcText.Contains('MULTI_ORDER_SKIP_XL')
}
$AuditPath = Join-Path $Root 'PATCH_AUDIT_v0.29.8_RACE.txt'
$checks.GetEnumerator() | ForEach-Object { "$($_.Key): $(if($_.Value){'PASS'}else{'FAIL'})" } | Set-Content $AuditPath -Encoding UTF8
if ($checks.Values -contains $false) { throw "PATCH AUDIT FAIL. See $AuditPath" }
Log 'v0.29.8 RACE patch audit: PASS'

# Save patched source archive before build.
Remove-Item $PatchedZip -Force -ErrorAction SilentlyContinue
Compress-Archive -Path (Join-Path $Project '*') -DestinationPath $PatchedZip -Force

# ---- Java 17+ ----
$javaCmd = Get-Command java.exe -ErrorAction SilentlyContinue
$needJava = $true
if ($javaCmd) {
  $v = (& $javaCmd.Source -version 2>&1 | Out-String)
  if ($v -match 'version "(\d+)') { if ([int]$Matches[1] -ge 17) { $needJava = $false } }
}
if ($needJava) {
  $JdkHome = Join-Path $Tools 'jdk17'
  $JdkZip = Join-Path $Tools 'jdk17.zip'
  if (-not (Test-Path (Join-Path $JdkHome 'bin\java.exe'))) {
    Download 'https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk' $JdkZip
    $tmp = Join-Path $Tools '_jdk'
    Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Force -Path $tmp | Out-Null
    Expand-Archive $JdkZip $tmp -Force
    $j = Get-ChildItem $tmp -Recurse -Filter java.exe | Where-Object { $_.FullName -match '\\bin\\java\.exe$' } | Select-Object -First 1
    if (-not $j) { throw 'JDK download/extract failed.' }
    $home = Split-Path -Parent (Split-Path -Parent $j.FullName)
    Remove-Item $JdkHome -Recurse -Force -ErrorAction SilentlyContinue
    Move-Item $home $JdkHome
  }
  $env:JAVA_HOME = $JdkHome
  $env:PATH = "$JdkHome\bin;$env:PATH"
}
Log "JAVA_HOME=$env:JAVA_HOME"

# ---- Android SDK 35 ----
$Sdk = Join-Path $Tools 'android-sdk'
$SdkManager = Join-Path $Sdk 'cmdline-tools\latest\bin\sdkmanager.bat'
if (-not (Test-Path $SdkManager)) {
  $cmdZip = Join-Path $Tools 'cmdline-tools.zip'
  Download 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip' $cmdZip
  $tmp = Join-Path $Tools '_cmd'
  Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  Expand-Archive $cmdZip $tmp -Force
  New-Item -ItemType Directory -Force -Path (Join-Path $Sdk 'cmdline-tools') | Out-Null
  Move-Item (Join-Path $tmp 'cmdline-tools') (Join-Path $Sdk 'cmdline-tools\latest')
}
$env:ANDROID_HOME = $Sdk
$env:ANDROID_SDK_ROOT = $Sdk
$yes = (1..80 | ForEach-Object { 'y' }) -join "`n"
$yes | & $SdkManager "--sdk_root=$Sdk" --licenses | Out-Null
& $SdkManager "--sdk_root=$Sdk" 'platform-tools' 'platforms;android-35' 'build-tools;35.0.0'
if ($LASTEXITCODE -ne 0) { throw 'Android SDK component installation failed.' }
"sdk.dir=$($Sdk.Replace('\','\\'))" | Set-Content (Join-Path $Project 'local.properties') -Encoding ASCII

# ---- Build full APK ----
$Gradlew = Join-Path $Project 'gradlew.bat'
if (-not (Test-Path $Gradlew)) { throw 'gradlew.bat missing from the full source.' }
Push-Location $Project
try {
  & cmd.exe /c "`"$Gradlew`" --no-daemon clean assembleDebug" 2>&1 | Tee-Object -FilePath (Join-Path $Root 'GRADLE_BUILD_v0.29.8_RACE.txt')
  if ($LASTEXITCODE -ne 0) { throw 'Gradle build failed.' }
} finally { Pop-Location }
$Built = Join-Path $Project 'app\build\outputs\apk\debug\app-debug.apk'
if (-not (Test-Path $Built)) { throw 'APK missing after successful Gradle task.' }
Copy-Item $Built $OutApk -Force

# ---- Verify APK ----
$BT = Join-Path $Sdk 'build-tools\35.0.0'
$Aapt = Join-Path $BT 'aapt.exe'
$Signer = Join-Path $BT 'apksigner.bat'
$Zipalign = Join-Path $BT 'zipalign.exe'
$badging = (& $Aapt dump badging $OutApk 2>&1 | Out-String)
$badging | Set-Content (Join-Path $Root 'APK_BADGING_v0.29.8_RACE.txt') -Encoding UTF8
if ($badging -notmatch "package: name='com\.local\.ubcabassistant'") { throw 'APK package audit failed.' }
if ($badging -notmatch "versionCode='298'") { throw 'APK versionCode audit failed.' }
if ($badging -notmatch "versionName='0\.29\.8'") { throw 'APK versionName audit failed.' }
& $Signer verify --verbose --print-certs $OutApk *> (Join-Path $Root 'APKSIG_v0.29.8_RACE.txt')
if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed.' }
& $Zipalign -c -v 4 $OutApk *> (Join-Path $Root 'ZIPALIGN_v0.29.8_RACE.txt')
if ($LASTEXITCODE -ne 0) { throw 'APK zipalign verification failed.' }
$sha = (Get-FileHash $OutApk -Algorithm SHA256).Hash.ToLower()
"$sha  UBCabOrderHelper-v0.29.8-RACE.apk" | Set-Content (Join-Path $Root 'SHA256_v0.29.8_RACE.txt') -Encoding ASCII
Log "APK build/verify PASS SHA256=$sha"

# ---- ADB + install ----
$Adb = Join-Path $Sdk 'platform-tools\adb.exe'
& $Adb start-server | Out-Null
$devices = @()
foreach ($line in (& $Adb devices)) { if ($line -match '^(\S+)\s+device$') { $devices += $Matches[1] } }
if ($devices.Count -ne 1) { & $Adb devices -l; throw 'Connect exactly ONE authorized Android device.' }
$Serial = $devices[0]
$Model = (& $Adb -s $Serial shell getprop ro.product.model).Trim()
Log "Installing on $Model / $Serial"
& $Adb -s $Serial install -r $OutApk
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'Update install failed, usually because the signing certificate differs.'
  Write-Host 'UBCab Driver itself will NOT be removed.'
  $ans = Read-Host 'Type YES to clean-reinstall ONLY com.local.ubcabassistant'
  if ($ans -ne 'YES') { throw 'Installation cancelled.' }
  & $Adb -s $Serial uninstall com.local.ubcabassistant | Out-Null
  & $Adb -s $Serial install $OutApk
  if ($LASTEXITCODE -ne 0) { throw 'Clean helper installation failed.' }
}
$pkg = (& $Adb -s $Serial shell dumpsys package com.local.ubcabassistant 2>&1 | Out-String)
$pkg | Set-Content (Join-Path $Root 'INSTALLED_PACKAGE_v0.29.8_RACE.txt') -Encoding UTF8
if ($pkg -notmatch 'versionCode=298') { throw 'Installed helper is not versionCode 298.' }
if ($pkg -notmatch 'versionName=0\.29\.8') { throw 'Installed helper is not versionName 0.29.8.' }
& $Adb -s $Serial shell monkey -p com.local.ubcabassistant 1 | Out-Null
& $Adb -s $Serial shell am start -a android.settings.ACCESSIBILITY_SETTINGS | Out-Null
Log 'INSTALL SUCCESS v0.29.8 RACE'
Write-Host ''
Write-Host 'v0.29.8 RACE installed.'
Write-Host 'Choose FIRST DAY or NEXT DAY in the helper. There is no automatic 20:00 switch.'
Write-Host 'Recommended during UBCab competition: disable Tino helper and Link to Windows Accessibility.'
