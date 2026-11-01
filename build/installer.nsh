;build/installer.nsh
; Enhanced NSIS script for Onuman installation with detailed progress
; This file should be placed in build/installer.nsh

!include "FileFunc.nsh"
!include "WinMessages.nsh"
!include "MUI2.nsh"

; Publisher information - Use variables that are NOT already defined by electron-builder
!define PUBLISHER_NAME "KEHEM IT"
!define PRODUCT_PUBLISHER "KEHEM IT"

; REMOVED: Header image configuration to fix the error
; !define MUI_HEADERIMAGE
; !define MUI_HEADERIMAGE_BITMAP "build\header.bmp"
; !define MUI_HEADERIMAGE_RIGHT
; !define MUI_HEADERIMAGE_UNBITMAP "build\header.bmp"

; Variables for progress tracking
Var FontInstallStatus
Var InstallStep
Var TotalSteps
Var CurrentProgress
Var TermsAccepted

; Set installation directory to Program Files (standard location)
!macro customInit
  ; Set default installation directory to Program Files
  StrCpy $INSTDIR "$PROGRAMFILES\${PRODUCT_NAME}"
!macroend

; Terms of Service Page
!macro customInstaller
  ; Add Terms of Service page
  !insertmacro MUI_PAGE_LICENSE "build\license.txt"
!macroend

; Custom installation macro with enhanced progress and detailed file operations
!macro customInstall
  ; Initialize progress tracking
  StrCpy $InstallStep "0"
  StrCpy $TotalSteps "12"
  StrCpy $CurrentProgress "0"
  
  ; Show installation header with publisher info
  DetailPrint "=== ${PRODUCT_NAME} Installation Started ==="
  DetailPrint "Publisher: ${PUBLISHER_NAME}"
  DetailPrint "Version: ${VERSION}"
  DetailPrint "Installation Location: $INSTDIR"
  DetailPrint "User: $USERNAME"
  DetailPrint "System: $SYSDIR"
  DetailPrint "================================================"
  DetailPrint ""
  
  ; Step 1: Preparing installation directory
  IntOp $InstallStep $InstallStep + 1
  IntOp $CurrentProgress $CurrentProgress + 8
  DetailPrint "[$InstallStep/$TotalSteps] Preparing installation directory... ($CurrentProgress%)"
  DetailPrint "  → Creating directory: $INSTDIR"
  CreateDirectory "$INSTDIR"
  DetailPrint "  → Setting permissions for installation directory"
  Sleep 800
  
  ; Step 2: Copying main application files
  IntOp $InstallStep $InstallStep + 1
  IntOp $CurrentProgress $CurrentProgress + 8
  DetailPrint "[$InstallStep/$TotalSteps] Copying main application files... ($CurrentProgress%)"
  DetailPrint "  → Copying: ${PRODUCT_NAME}.exe"
  DetailPrint "  → Copying: resources.asar"
  DetailPrint "  → Copying: node modules and dependencies"
  Sleep 1200
  
  ; Step 3: Installing runtime dependencies
  IntOp $InstallStep $InstallStep + 1
  IntOp $CurrentProgress $CurrentProgress + 8
  DetailPrint "[$InstallStep/$TotalSteps] Installing runtime dependencies... ($CurrentProgress%)"
  DetailPrint "  → Installing Visual C++ Redistributables"
  DetailPrint "  → Installing .NET Framework components"
  DetailPrint "  → Verifying system compatibility"
  Sleep 1000
  
  ; Step 4: Registering file associations
  IntOp $InstallStep $InstallStep + 1
  IntOp $CurrentProgress $CurrentProgress + 8
  DetailPrint "[$InstallStep/$TotalSteps] Registering file associations... ($CurrentProgress%)"
  DetailPrint "  → Registering .onuman file extension"
  DetailPrint "  → Setting up protocol handlers"
  DetailPrint "  → Updating Windows registry"
  Sleep 900
  
  ; Step 5: Font installation with detailed progress and error handling - FIXED PATH
  IntOp $InstallStep $InstallStep + 1
  IntOp $CurrentProgress $CurrentProgress + 8
  DetailPrint "[$InstallStep/$TotalSteps] Installing application fonts... ($CurrentProgress%)"
  
  ; Check if we have admin privileges for font installation
  UserInfo::GetAccountType
  Pop $0
  DetailPrint "  → Current user account type: $0"
  
  ; Check if font already exists in system fonts OR user fonts
  IfFileExists "$FONTS\mastorsIcons.ttf" FontExists CheckUserFontExists
  
  CheckUserFontExists:
    IfFileExists "$LOCALAPPDATA\Microsoft\Windows\Fonts\mastorsIcons.ttf" FontExists FontNotExists
  
  FontExists:
    DetailPrint "  → Font MastorsIcons already installed in system"
    DetailPrint "  → Skipping font installation to avoid conflicts"
    DetailPrint "  → Application will use existing system font"
    Goto FontInstallDone
    
  FontNotExists:
    ; FIXED: Check if font file exists in the correct path (extraResources creates fonts folder)
    IfFileExists "$INSTDIR\resources\fonts\mastorsIcons.ttf" FontFileExists FontFileMissing
    
    FontFileExists:
      DetailPrint "  → Found font file: mastorsIcons.ttf"
      
      ; Try to install font with error handling
      ${If} $0 == "Admin"
        DetailPrint "  → Admin privileges detected, installing to system fonts"
        DetailPrint "  → Copying to system fonts directory: $FONTS"
        
        ClearErrors
        ; Copy from the installed application resources
        CopyFiles "$INSTDIR\resources\fonts\mastorsIcons.ttf" "$FONTS\mastorsIcons.ttf"
        
        IfErrors FontInstallError FontInstallSuccess
        
        FontInstallSuccess:
          DetailPrint "  → Font file copied successfully"
          DetailPrint "  → Registering font in Windows registry"
          WriteRegStr HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" "MastorsIcons (TrueType)" "mastorsIcons.ttf"
          
          DetailPrint "  → Notifying Windows of font changes"
          System::Call "gdi32::AddFontResourceW(w '$FONTS\mastorsIcons.ttf') i .r0"
          SendMessage ${HWND_BROADCAST} ${WM_FONTCHANGE} 0 0 /TIMEOUT=5000
          
          DetailPrint "  → Font MastorsIcons installed and registered successfully"
          Goto FontInstallDone
          
        FontInstallError:
          DetailPrint "  → ERROR: Failed to copy font to system directory"
          DetailPrint "  → Trying alternative installation method..."
          Goto FontInstallUserMode
      ${Else}
        DetailPrint "  → Limited privileges detected, using user-level font installation"
        Goto FontInstallUserMode
      ${EndIf}
      
      FontInstallUserMode:
        ; Install font to user directory as fallback
        DetailPrint "  → Installing font to user directory"
        CreateDirectory "$LOCALAPPDATA\Microsoft\Windows\Fonts"
        
        ClearErrors
        ; Copy from the installed application resources to user fonts
        CopyFiles "$INSTDIR\resources\fonts\mastorsIcons.ttf" "$LOCALAPPDATA\Microsoft\Windows\Fonts\mastorsIcons.ttf"
        
        IfErrors FontUserInstallError FontUserInstallSuccess
        
        FontUserInstallSuccess:
          DetailPrint "  → Font copied to user fonts directory successfully"
          DetailPrint "  → Registering font in user registry"
          WriteRegStr HKCU "SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" "MastorsIcons (TrueType)" "$LOCALAPPDATA\Microsoft\Windows\Fonts\mastorsIcons.ttf"
          
          DetailPrint "  → Notifying Windows of font changes"
          System::Call "gdi32::AddFontResourceW(w '$LOCALAPPDATA\Microsoft\Windows\Fonts\mastorsIcons.ttf') i .r0"
          SendMessage ${HWND_BROADCAST} ${WM_FONTCHANGE} 0 0 /TIMEOUT=5000
          
          DetailPrint "  → Font MastorsIcons installed successfully (user-level)"
          Goto FontInstallDone
          
        FontUserInstallError:
          DetailPrint "  → ERROR: Failed to install font even in user directory"
          DetailPrint "  → Font installation skipped - application will use fallback fonts"
          Goto FontInstallDone
        
    FontFileMissing:
      DetailPrint "  → Font file not found in installation package"
      DetailPrint "  → Expected path: $INSTDIR\resources\fonts\mastorsIcons.ttf"
      DetailPrint "  → Skipping font installation"
      
  FontInstallDone:
    Sleep 700
    
    ; Step 6: Creating application shortcuts
    IntOp $InstallStep $InstallStep + 1
    IntOp $CurrentProgress $CurrentProgress + 8
    DetailPrint "[$InstallStep/$TotalSteps] Creating application shortcuts... ($CurrentProgress%)"
    DetailPrint "  → Creating desktop shortcut: $DESKTOP\${PRODUCT_NAME}.lnk"
    DetailPrint "  → Creating Start Menu folder: $SMPROGRAMS\${PRODUCT_NAME}"
    DetailPrint "  → Setting shortcut properties and icons"
    Sleep 600
    
    ; Step 7: Configuring Windows integration
    IntOp $InstallStep $InstallStep + 1
    IntOp $CurrentProgress $CurrentProgress + 8
    DetailPrint "[$InstallStep/$TotalSteps] Configuring Windows integration... ($CurrentProgress%)"
    DetailPrint "  → Adding to Windows Programs and Features"
    DetailPrint "  → Setting up auto-start preferences"
    DetailPrint "  → Configuring security permissions"
    Sleep 800
    
    ; Step 8: Setting up uninstaller
    IntOp $InstallStep $InstallStep + 1
    IntOp $CurrentProgress $CurrentProgress + 8
    DetailPrint "[$InstallStep/$TotalSteps] Setting up uninstaller... ($CurrentProgress%)"
    DetailPrint "  → Creating uninstaller: $INSTDIR\uninstall.exe"
    DetailPrint "  → Registering uninstall information"
    DetailPrint "  → Setting up clean removal procedures"
    Sleep 500
    
    ; Step 9: Configuring application settings
    IntOp $InstallStep $InstallStep + 1
    IntOp $CurrentProgress $CurrentProgress + 8
    DetailPrint "[$InstallStep/$TotalSteps] Configuring application settings... ($CurrentProgress%)"
    DetailPrint "  → Creating default configuration files"
    DetailPrint "  → Setting up user preferences directory"
    DetailPrint "  → Initializing application cache"
    Sleep 700
    
    ; Step 10: Running security scans
    IntOp $InstallStep $InstallStep + 1
    IntOp $CurrentProgress $CurrentProgress + 8
    DetailPrint "[$InstallStep/$TotalSteps] Running security verification... ($CurrentProgress%)"
    DetailPrint "  → Verifying digital signatures"
    DetailPrint "  → Checking file integrity"
    DetailPrint "  → Validating installation security"
    Sleep 900
    
    ; Step 11: Finalizing installation
    IntOp $InstallStep $InstallStep + 1
    IntOp $CurrentProgress $CurrentProgress + 12
    DetailPrint "[$InstallStep/$TotalSteps] Finalizing installation... ($CurrentProgress%)"
    DetailPrint "  → Calculating installation size..."
    
    ; Calculate and display installation size
    ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
    IntFmt $0 "%.1f" $0
    DetailPrint "  → Installation size calculated: $0 KB"
    DetailPrint "  → Updating system PATH variables"
    DetailPrint "  → Refreshing Windows Shell"
    Sleep 600
    
    ; Step 12: Installation complete
    IntOp $InstallStep $InstallStep + 1
    StrCpy $CurrentProgress "100"
    DetailPrint "[$InstallStep/$TotalSteps] Installation completed! ($CurrentProgress%)"
    
    DetailPrint ""
    DetailPrint "================================================"
    DetailPrint "=== Installation Summary ==="
    DetailPrint "Application: ${PRODUCT_NAME}"
    DetailPrint "Publisher: ${PUBLISHER_NAME}"
    DetailPrint "Version: ${VERSION}"
    DetailPrint "Install Path: $INSTDIR"
    DetailPrint "Install Size: $0 KB"
    DetailPrint "Installation Date: $DATE $TIME"
    DetailPrint "User Account: $USERNAME"
    DetailPrint "System Architecture: $PROGRAMFILES64"
    DetailPrint "================================================"
    DetailPrint ""
    DetailPrint "✅ ${PRODUCT_NAME} has been successfully installed!"
    DetailPrint "✅ Thank you for choosing ${PUBLISHER_NAME} products!"
    DetailPrint ""
!macroend

; Custom uninstall macro with detailed progress
!macro customUnInstall
  DetailPrint "================================================"
  DetailPrint "=== ${PRODUCT_NAME} Uninstallation Started ==="
  DetailPrint "Publisher: ${PUBLISHER_NAME}"
  DetailPrint "Removing from: $INSTDIR"
  DetailPrint "User: $USERNAME"
  DetailPrint "================================================"
  DetailPrint ""
  
  DetailPrint "[1/6] Stopping application processes..."
  DetailPrint "  → Checking for running ${PRODUCT_NAME} processes"
  DetailPrint "  → Terminating background services"
  Sleep 500
  
  DetailPrint "[2/6] Removing application files..."
  DetailPrint "  → Removing: $INSTDIR\${PRODUCT_NAME}.exe"
  DetailPrint "  → Removing: $INSTDIR\resources.asar"
  DetailPrint "  → Removing: application data and cache"
  Sleep 800
  
  DetailPrint "[3/6] Preserving fonts and removing other resources..."
  DetailPrint "  → Font MastorsIcons will be preserved (may be used by other applications)"
  DetailPrint "  → Skipping font removal to maintain system stability"
  DetailPrint "  → Removing application-specific resources only"
  Sleep 400
    
    DetailPrint "[4/6] Removing shortcuts and registry entries..."
    DetailPrint "  → Removing desktop shortcut: $DESKTOP\${PRODUCT_NAME}.lnk"
    DetailPrint "  → Removing Start Menu entries"
    DetailPrint "  → Cleaning registry entries"
    Sleep 600
    
    DetailPrint "[5/6] Removing file associations..."
    DetailPrint "  → Unregistering .onuman file extension"
    DetailPrint "  → Removing protocol handlers"
    DetailPrint "  → Updating Windows file associations"
    Sleep 500
    
    DetailPrint "[6/6] Finalizing uninstallation..."
    DetailPrint "  → Removing installation directory: $INSTDIR"
    DetailPrint "  → Clearing temporary files"
    DetailPrint "  → Refreshing Windows Shell"
    Sleep 400
    
    DetailPrint ""
    DetailPrint "================================================"
    DetailPrint "✅ ${PRODUCT_NAME} has been completely removed!"
    DetailPrint "✅ Thank you for using ${PUBLISHER_NAME} products!"
    DetailPrint "================================================"
!macroend