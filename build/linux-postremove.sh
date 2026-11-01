#!/bin/bash

#build/linux-postremove.sh
# Linux post-remove script for Onuman
# This script removes the mastorsIcons.ttf font from the system

set -e

APP_NAME="onuman"
FONT_NAME="mastorsIcons.ttf"

echo "=== Onuman Post-Removal Script ==="
echo "Removing application fonts..."

# Function to remove font from system
remove_font_system() {
    font_path="/usr/share/fonts/truetype/onuman/$FONT_NAME"
    font_dir="/usr/share/fonts/truetype/onuman"
    
    if [ -f "$font_path" ]; then
        echo "Removing system font: $font_path"
        rm -f "$font_path"
        
        # Remove directory if empty
        if [ -d "$font_dir" ] && [ -z "$(ls -A "$font_dir")" ]; then
            echo "Removing empty font directory: $font_dir"
            rmdir "$font_dir"
        fi
        
        return 0
    else
        echo "System font not found: $font_path"
        return 1
    fi
}

# Function to remove font from user directory
remove_font_user() {
    font_path="$HOME/.local/share/fonts/$FONT_NAME"
    
    if [ -f "$font_path" ]; then
        echo "Removing user font: $font_path"
        rm -f "$font_path"
        return 0
    else
        echo "User font not found: $font_path"
        return 1
    fi
}

# Check if we should remove fonts (be conservative)
echo "Checking for Onuman-specific font installations..."

# Only remove fonts from our specific directory to avoid conflicts
font_removed=false

# Remove from system directory (our specific subdirectory)
if remove_font_system; then
    font_removed=true
fi

# Note: We don't automatically remove from user directory as it might be used by other apps
# The user can manually remove it if needed

if [ "$font_removed" = true ]; then
    echo "Fonts removed successfully"
    
    # Update font cache
    echo "Updating font cache..."
    if command -v fc-cache >/dev/null 2>&1; then
        if fc-cache -f -v >/dev/null 2>&1; then
            echo "Font cache updated successfully"
        else
            echo "Warning: Failed to update font cache"
        fi
    else
        echo "Warning: fc-cache not found. Font cache not updated."
    fi
else
    echo "No Onuman-specific fonts found to remove"
fi

echo "Font removal completed!"
echo "Note: If fonts were installed to user directory (~/.local/share/fonts),"
echo "      they were preserved to avoid conflicts with other applications."
echo "      You can manually remove them if needed."
echo "============================================"

exit 0