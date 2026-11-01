#!/bin/bash

#build/linux-postinstall.sh
# Linux post-install script for Onuman
# This script installs the mastorsIcons.ttf font to the system

set -e

APP_NAME="onuman"
FONT_NAME="mastorsIcons.ttf"
# Updated path - electron-builder installs to /opt/{ProductName} by default
INSTALL_DIR="/opt/Onuman"
FONT_SOURCE="$INSTALL_DIR/resources/fonts/$FONT_NAME"

echo "=== Onuman Post-Installation Script ==="
echo "Installing system fonts..."
echo "Looking for font at: $FONT_SOURCE"

# Function to log with timestamp
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to install font to system
install_font_system() {
    font_dir="/usr/share/fonts/truetype/onuman"
    
    log_message "Creating system font directory: $font_dir"
    mkdir -p "$font_dir" || {
        log_message "ERROR: Failed to create system font directory"
        return 1
    }
    
    if [ -f "$FONT_SOURCE" ]; then
        log_message "Copying font from: $FONT_SOURCE"
        log_message "Copying font to: $font_dir/$FONT_NAME"
        
        if cp "$FONT_SOURCE" "$font_dir/$FONT_NAME" 2>/dev/null; then
            # Set proper permissions
            chmod 644 "$font_dir/$FONT_NAME" || log_message "Warning: Could not set font permissions"
            log_message "Font installed successfully to: $font_dir/$FONT_NAME"
            return 0
        else
            log_message "ERROR: Failed to copy font to system directory"
            return 1
        fi
    else
        log_message "ERROR: Font source not found: $FONT_SOURCE"
        # List what's actually in the resources directory for debugging
        if [ -d "$INSTALL_DIR/resources" ]; then
            log_message "Contents of $INSTALL_DIR/resources:"
            ls -la "$INSTALL_DIR/resources/" || true
            if [ -d "$INSTALL_DIR/resources/fonts" ]; then
                log_message "Contents of $INSTALL_DIR/resources/fonts:"
                ls -la "$INSTALL_DIR/resources/fonts/" || true
            fi
        fi
        return 1
    fi
}

# Function to install font to user directory (fallback)
install_font_user() {
    # Get the user who invoked sudo (if applicable)
    target_user="${SUDO_USER:-$USER}"
    user_home
    
    if [ "$target_user" = "root" ]; then
        log_message "Running as root without sudo, skipping user font installation"
        return 1
    fi
    
    # Get the home directory for the target user
    user_home=$(getent passwd "$target_user" | cut -d: -f6)
    user_font_dir="$user_home/.local/share/fonts"
    
    log_message "Installing font for user: $target_user"
    log_message "User home directory: $user_home"
    log_message "Creating user font directory: $user_font_dir"
    
    # Create directory as the target user
    sudo -u "$target_user" mkdir -p "$user_font_dir" || {
        log_message "ERROR: Failed to create user font directory"
        return 1
    }
    
    if [ -f "$FONT_SOURCE" ]; then
        log_message "Copying font to user directory..."
        
        if sudo -u "$target_user" cp "$FONT_SOURCE" "$user_font_dir/$FONT_NAME" 2>/dev/null; then
            # Set proper permissions
            sudo -u "$target_user" chmod 644 "$user_font_dir/$FONT_NAME" || log_message "Warning: Could not set font permissions"
            log_message "Font installed successfully to: $user_font_dir/$FONT_NAME"
            return 0
        else
            log_message "ERROR: Failed to copy font to user directory"
            return 1
        fi
    else
        log_message "ERROR: Font source not found: $FONT_SOURCE"
        return 1
    fi
}

# Check if font already exists in common locations
check_existing_font() {
    locations=(
        "/usr/share/fonts/truetype/onuman/$FONT_NAME"
        "/usr/local/share/fonts/$FONT_NAME"
        "/usr/share/fonts/$FONT_NAME"
    )
    
    for location in "${locations[@]}"; do
        if [ -f "$location" ]; then
            log_message "Font $FONT_NAME already installed at: $location"
            return 0
        fi
    done
    
    # Check user fonts if we have a sudo user
    if [ -n "$SUDO_USER" ] && [ "$SUDO_USER" != "root" ]; then
        user_home=$(getent passwd "$SUDO_USER" | cut -d: -f6)
        if sudo -u "$SUDO_USER" fc-cache -f -v "$user_home/.local/share/fonts" 2>/dev/null; then
            log_message "User font cache updated successfully"
        else
            log_message "Warning: Failed to update user font cache"
        fi
    fi
    return 1
}

# Main font installation logic
if check_existing_font; then
    log_message "Font $FONT_NAME already installed, skipping installation"
else
    log_message "Installing font $FONT_NAME..."
    
    # Try to install to system directory first
    if install_font_system; then
        log_message "Font installed successfully to system directory"
    else
        log_message "Failed to install to system directory, trying user directory..."
        if install_font_user; then
            log_message "Font installed successfully to user directory"
        else
            log_message "WARNING: Failed to install font to both system and user directories"
            log_message "Application will use fallback fonts"
            # Don't exit with error - this shouldn't prevent the app from working
        fi
    fi
fi

# Update font cache
log_message "Updating font cache..."
if command -v fc-cache >/dev/null 2>&1; then
    # Update system font cache
    if fc-cache -f -v 2>/dev/null; then
        log_message "System font cache updated successfully"
    else
        log_message "Warning: Failed to update system font cache"
    fi
    
    # Update user font cache if we have a sudo user
    if [ -n "$SUDO_USER" ] && [ "$SUDO_USER" != "root" ]; then
        # local user_home
        user_home=$(getent passwd "$SUDO_USER" | cut -d: -f6)
        if sudo -u "$SUDO_USER" fc-cache -f -v "$user_home/.local/share/fonts" 2>/dev/null; then
            log_message "User font cache updated successfully"
        else
            log_message "Warning: Failed to update user font cache"
        fi
    fi
else
    log_message "Warning: fc-cache not found. Font cache not updated."
fi

# Verify font installation
log_message "Verifying font installation..."
if command -v fc-list >/dev/null 2>&1; then
    if fc-list | grep -i "mastors" >/dev/null 2>&1; then
        log_message "✅ Font verification successful: mastorsIcons font is available"
    else
        log_message "⚠️  Font verification failed: mastorsIcons font not found in font cache"
        log_message "   This may be temporary - the font should be available after reboot"
    fi
else
    log_message "⚠️  Cannot verify font installation (fc-list not available)"
fi

# Set up desktop integration
log_message "Setting up desktop integration..."

# Ensure the application appears in the application menu
if [ -f "/usr/share/applications/onuman.desktop" ]; then
    log_message "Desktop file found, updating desktop database..."
    if command -v update-desktop-database >/dev/null 2>&1; then
        update-desktop-database /usr/share/applications/ 2>/dev/null || log_message "Warning: Failed to update desktop database"
    fi
fi

# Update MIME database if needed
if command -v update-mime-database >/dev/null 2>&1; then
    update-mime-database /usr/share/mime/ 2>/dev/null || log_message "Warning: Failed to update MIME database"
fi

log_message "Font installation and desktop integration completed!"
log_message "============================================"

exit 0