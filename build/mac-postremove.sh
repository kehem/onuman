#!/bin/bash

#build/mac-postremove.sh
# macOS post-remove script for Onuman
# This script removes the mastorsIcons.ttf font from the system

set -e

APP_NAME="Onuman"
FONT_NAME="mastorsIcons.ttf"

echo "=== Onuman macOS Post-Removal Script ==="
echo "Cleaning up application fonts..."

# Function to check if other applications might be using the font
check_font_usage() {
    local font_name="mastorsIcons"
    
    # Look for other applications that might have the same font
    echo "Checking if other applications are using the font..."
    
    # Check other app bundles in /Applications
    local other_apps_count=0
    for app in /Applications/*.app; do
        if [ -d "$app" ] && [ "$(basename "$app")" != "$APP_NAME.app" ]; then
            if find "$app" -name "$FONT_NAME" 2>/dev/null | grep -q "$FONT_NAME"; then
                echo "Found font in other application: $(basename "$app")"
                ((other_apps_count++))
            fi
        fi
    done
    
    if [ $other_apps_count -gt 0 ]; then
        echo "⚠️  Font is used by $other_apps_count other application(s)"
        return 1  # Don't remove
    else
        echo "✅ No other applications found using this font"
        return 0  # Safe to remove
    fi
}

# Function to remove font from system directory
remove_font_system() {
    local font_path="/Library/Fonts/$FONT_NAME"
    
    if [ -f "$font_path" ]; then
        echo "Found system font: $font_path"
        
        # Check if we have permission to remove it
        if [ -w "/Library/Fonts" ]; then
            echo "Removing system font: $font_path"
            rm -f "$font_path"
            echo "System font removed successfully"
            return 0
        else
            echo "Insufficient permissions to remove system font"
            echo "You may need to manually remove: $font_path"
            return 1
        fi
    else
        echo "System font not found: $font_path"
        return 1
    fi
}

# Function to remove font from user directory
remove_font_user() {
    local font_path="$HOME/Library/Fonts/$FONT_NAME"
    
    if [ -f "$font_path" ]; then
        echo "Found user font: $font_path"
        echo "Removing user font: $font_path"
        rm -f "$font_path"
        echo "User font removed successfully"
        return 0
    else
        echo "User font not found: $font_path"
        return 1
    fi
}

# Function to clean up application support files
cleanup_app_support() {
    local app_support_dir="$HOME/Library/Application Support/$APP_NAME"
    
    if [ -d "$app_support_dir" ]; then
        echo "Cleaning up application support directory..."
        
        # Remove font configuration
        local font_config="$app_support_dir/font-config.json"
        if [ -f "$font_config" ]; then
            echo "Removing font configuration: $font_config"
            rm -f "$font_config"
        fi
        
        # Remove directory if empty
        if [ -z "$(ls -A "$app_support_dir" 2>/dev/null)" ]; then
            echo "Removing empty application support directory: $app_support_dir"
            rmdir "$app_support_dir"
        else
            echo "Application support directory contains other files, preserving: $app_support_dir"
        fi
    fi
}

# Main removal logic
echo "Starting font cleanup process..."

# Check if it's safe to remove the font
if check_font_usage; then
    echo "Proceeding with font removal..."
    
    font_removed=false
    
    # Try to remove from system directory first
    if remove_font_system; then
        font_removed=true
    fi
    
    # Also check user directory
    if remove_font_user; then
        font_removed=true
    fi
    
    if [ "$font_removed" = true ]; then
        echo "Font removal completed successfully"
        
        # Clear font cache
        echo "Refreshing font cache..."
        
        # Try to refresh font cache using atsutil (if available)
        if command -v atsutil >/dev/null 2>&1; then
            atsutil databases -remove 2>/dev/null || true
            echo "Font cache cleared using atsutil"
        fi
        
        # Alternative method
        osascript -e 'tell application "Font Book" to quit' 2>/dev/null || true
        
        echo "Font cache refresh completed"
    else
        echo "No fonts were found to remove"
    fi
else
    echo "⚠️  Font removal skipped to prevent conflicts with other applications"
    echo "    If you want to remove the font manually, check these locations:"
    echo "    - /Library/Fonts/$FONT_NAME"
    echo "    - $HOME/Library/Fonts/$FONT_NAME"
fi

# Clean up application support files regardless
cleanup_app_support

echo ""
echo "Font cleanup completed!"
echo "============================================"

exit 0