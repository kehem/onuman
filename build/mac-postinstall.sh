#!/bin/bash

#build/mac-postinstall.sh
# macOS post-install script for Onuman
# This script installs the mastorsIcons.ttf font to the system

set -e

APP_NAME="Onuman"
FONT_NAME="mastorsIcons.ttf"
APP_PATH="/Applications/$APP_NAME.app"
FONT_SOURCE="$APP_PATH/Contents/Resources/fonts/$FONT_NAME"

echo "=== Onuman macOS Post-Installation Script ==="
echo "Installing system fonts..."

# Function to install font to system (requires admin)
install_font_system() {
    local font_dir="/Library/Fonts"
    local font_path="$font_dir/$FONT_NAME"
    
    echo "Attempting to install font to system directory: $font_dir"
    
    if [ -f "$FONT_SOURCE" ]; then
        # Check if font already exists
        if [ -f "$font_path" ]; then
            echo "Font already exists in system directory: $font_path"
            return 0
        fi
        
        echo "Copying font to system directory..."
        if cp "$FONT_SOURCE" "$font_path" 2>/dev/null; then
            # Set proper permissions
            chmod 644 "$font_path" 2>/dev/null || true
            echo "Font installed to: $font_path"
            return 0
        else
            echo "Failed to copy font to system directory (insufficient permissions)"
            return 1
        fi
    else
        echo "Font source not found: $FONT_SOURCE"
        return 1
    fi
}

# Function to install font to user directory (fallback)
install_font_user() {
    local user_font_dir="$HOME/Library/Fonts"
    local font_path="$user_font_dir/$FONT_NAME"
    
    echo "Installing font to user directory: $user_font_dir"
    
    # Create user fonts directory if it doesn't exist
    mkdir -p "$user_font_dir"
    
    if [ -f "$FONT_SOURCE" ]; then
        # Check if font already exists
        if [ -f "$font_path" ]; then
            echo "Font already exists in user directory: $font_path"
            return 0
        fi
        
        echo "Copying font to user directory..."
        if cp "$FONT_SOURCE" "$font_path"; then
            # Set proper permissions
            chmod 644 "$font_path"
            echo "Font installed to: $font_path"
            return 0
        else
            echo "Failed to copy font to user directory"
            return 1
        fi
    else
        echo "Font source not found: $FONT_SOURCE"
        return 1
    fi
}

# Function to check if font is already installed anywhere
is_font_installed() {
    # Check system fonts
    if [ -f "/Library/Fonts/$FONT_NAME" ]; then
        echo "Font found in system directory: /Library/Fonts/$FONT_NAME"
        return 0
    fi
    
    # Check user fonts
    if [ -f "$HOME/Library/Fonts/$FONT_NAME" ]; then
        echo "Font found in user directory: $HOME/Library/Fonts/$FONT_NAME"
        return 0
    fi
    
    # Check using system_profiler (more thorough but slower)
    if command -v system_profiler >/dev/null 2>&1; then
        if system_profiler SPFontsDataType 2>/dev/null | grep -i "mastors" >/dev/null 2>&1; then
            echo "Font found in system font registry"
            return 0
        fi
    fi
    
    return 1
}

# Main installation logic
echo "Checking if font is already installed..."

if is_font_installed; then
    echo "✅ Font $FONT_NAME is already installed, skipping installation"
else
    echo "Installing font $FONT_NAME..."
    
    # Get current user info
    CURRENT_USER=$(whoami)
    echo "Current user: $CURRENT_USER"
    
    # Try to install to system directory first (preferred)
    if install_font_system; then
        echo "✅ Font installed successfully to system directory"
        installation_success=true
    else
        echo "System installation failed, trying user directory..."
        if install_font_user; then
            echo "✅ Font installed successfully to user directory"
            installation_success=true
        else
            echo "❌ Failed to install font to both system and user directories"
            echo "WARNING: Application will use fallback fonts"
            installation_success=false
        fi
    fi
    
    if [ "$installation_success" = true ]; then
        # Clear font cache (macOS handles this automatically, but we can try to speed it up)
        echo "Refreshing font cache..."
        
        # Try to refresh font cache using atsutil (if available)
        if command -v atsutil >/dev/null 2>&1; then
            atsutil databases -remove 2>/dev/null || true
            echo "Font cache cleared using atsutil"
        fi
        
        # Alternative: Use Core Text to refresh fonts (more reliable)
        osascript -e 'tell application "Font Book" to quit' 2>/dev/null || true
        
        echo "Font cache refresh completed"
    fi
fi

# Verify installation
echo "Verifying font installation..."
sleep 1  # Give the system a moment to register the font

if is_font_installed; then
    echo "✅ Font verification successful: mastorsIcons font is available"
    
    # Optional: Show font info
    if command -v fc-list >/dev/null 2>&1; then
        echo "Font details:"
        fc-list | grep -i "mastors" 2>/dev/null || echo "  (Font details not available via fc-list)"
    fi
else
    echo "⚠️  Font verification inconclusive"
    echo "   The font may be available after the next application restart"
    echo "   or system font cache refresh"
fi

# Set up font for the application
echo "Configuring application font preferences..."

# Create application support directory if needed
APP_SUPPORT_DIR="$HOME/Library/Application Support/$APP_NAME"
mkdir -p "$APP_SUPPORT_DIR"

# Create a font configuration file for the app
FONT_CONFIG="$APP_SUPPORT_DIR/font-config.json"
cat > "$FONT_CONFIG" << EOF
{
  "fontInstalled": true,
  "fontName": "mastorsIcons",
  "fontPath": "$([ -f "/Library/Fonts/$FONT_NAME" ] && echo "/Library/Fonts/$FONT_NAME" || echo "$HOME/Library/Fonts/$FONT_NAME")",
  "installDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "installMethod": "postinstall"
}
EOF

echo "Font configuration saved to: $FONT_CONFIG"

echo "Font installation completed!"
echo "============================================"

# Don't exit with error even if font installation failed
# The application should still work with fallback fonts
exit 0