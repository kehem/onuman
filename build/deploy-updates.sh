#!/bin/bash

# deploy-updates.sh
# Enhanced deployment script for Onuman auto-updates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$SCRIPT_DIR/deploy-config.sh"

# Parse command line arguments
TEST_MODE=false
VERBOSE=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --test)
            TEST_MODE=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --force|-f)
            FORCE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --test     Test mode (don't actually deploy)"
            echo "  --verbose  Verbose output"
            echo "  --force    Force deployment even if files exist"
            echo "  --help     Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Load configuration
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo -e "${RED}❌ Configuration file not found: $CONFIG_FILE${NC}"
    echo -e "${YELLOW}Creating template configuration file...${NC}"
    
    cat > "$CONFIG_FILE" << 'EOF'
#!/bin/bash

# Server Configuration - REPLACE WITH YOUR ACTUAL VALUES
export SERVER_HOST="your-server.com"              # Your server domain/IP
export SERVER_USER="ubuntu"                       # SSH username  
export SERVER_PATH="/var/www/onuman-updates"      # Update files path on server
export SSH_KEY_PATH="~/.ssh/id_rsa"              # SSH key path (optional)

# Local paths (usually don't need to change)
export DIST_PATH="./dist"
export BUILD_PATH="./build"

# Get app version from package.json
export APP_VERSION=$(node -p "require('./package.json').version")

echo "Configuration loaded for $SERVER_USER@$SERVER_HOST (v$APP_VERSION)"
EOF

    chmod +x "$CONFIG_FILE"
    echo -e "${GREEN}✅ Template created: $CONFIG_FILE${NC}"
    echo -e "${CYAN}📝 Please edit this file with your server details before deploying${NC}"
    exit 1
fi

# Default values if not set in config
DIST_PATH=${DIST_PATH:-"$PROJECT_ROOT/dist"}
SERVER_PATH=${SERVER_PATH:-"/var/www/onuman-updates"}
APP_VERSION=${APP_VERSION:-"unknown"}

# Validation
if [ "$SERVER_HOST" = "your-server.com" ] || [ -z "$SERVER_HOST" ]; then
    echo -e "${RED}❌ Please configure SERVER_HOST in $CONFIG_FILE${NC}"
    exit 1
fi

if [ -z "$SERVER_USER" ]; then
    echo -e "${RED}❌ Please configure SERVER_USER in $CONFIG_FILE${NC}"
    exit 1
fi

# Header
echo -e "${BLUE}🚀 Onuman Update Deployment${NC}"
echo -e "${BLUE}================================${NC}"
echo "  Server: $SERVER_USER@$SERVER_HOST"
echo "  Version: $APP_VERSION"
echo "  Path: $SERVER_PATH"
echo "  Dist: $DIST_PATH"
if [ "$TEST_MODE" = true ]; then
    echo -e "  Mode: ${YELLOW}TEST (no actual deployment)${NC}"
fi
echo ""

# Check if dist directory exists
if [ ! -d "$DIST_PATH" ]; then
    echo -e "${RED}❌ Dist directory not found: $DIST_PATH${NC}"
    echo -e "${YELLOW}Run one of these commands first:${NC}"
    echo "  npm run build:win"
    echo "  npm run build:mac"  
    echo "  npm run build:linux"
    exit 1
fi

# List available files
echo -e "${CYAN}📁 Available files in $DIST_PATH:${NC}"
ls -la "$DIST_PATH" | head -10
echo ""

if [ "$TEST_MODE" = true ]; then
    echo -e "${YELLOW}🧪 TEST MODE - No actual deployment will occur${NC}"
    echo ""
fi

# Test SSH connection (skip in test mode)
if [ "$TEST_MODE" = false ]; then
    echo -e "${YELLOW}🔐 Testing SSH connection...${NC}"
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" exit 2>/dev/null; then
        echo -e "${RED}❌ Cannot connect to server via SSH${NC}"
        echo -e "${YELLOW}Please ensure:${NC}"
        echo "  1. SSH key is configured and added to ssh-agent"
        echo "  2. Server details are correct in $CONFIG_FILE"
        echo "  3. Server is accessible and SSH key is authorized"
        echo ""
        echo -e "${CYAN}Try these commands:${NC}"
        echo "  ssh-add ~/.ssh/id_rsa"
        echo "  ssh $SERVER_USER@$SERVER_HOST"
        exit 1
    fi
    echo -e "${GREEN}✅ SSH connection successful${NC}"
    
    # Create remote directories if they don't exist
    echo -e "${YELLOW}📁 Setting up remote directories...${NC}"
    ssh "$SERVER_USER@$SERVER_HOST" "
        sudo mkdir -p $SERVER_PATH/{win,mac,linux} && 
        sudo chown -R www-data:www-data $SERVER_PATH && 
        sudo chmod -R 755 $SERVER_PATH &&
        echo 'Directories created and permissions set'
    " || {
        echo -e "${RED}❌ Failed to setup remote directories${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Remote directories ready${NC}"
fi

# Function to deploy platform-specific files
deploy_platform() {
    local platform=$1
    local file_pattern=$2
    local description=$3
    
    echo -e "${YELLOW}📦 Processing $description files...${NC}"
    
    local files_found=0
    local files_deployed=0
    
    # Process installer files
    for file in "$DIST_PATH"/$file_pattern; do
        if [ -f "$file" ]; then
            files_found=$((files_found + 1))
            local filename=$(basename "$file")
            echo "  Found: $filename"
            
            if [ "$TEST_MODE" = false ]; then
                if [ "$VERBOSE" = true ]; then
                    echo "    Uploading to $SERVER_PATH/$platform/$filename"
                fi
                if scp "$file" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/$platform/" 2>/dev/null; then
                    files_deployed=$((files_deployed + 1))
                    echo "    ✅ Uploaded successfully"
                else
                    echo "    ❌ Upload failed"
                fi
            else
                echo "    📝 Would upload to $platform/"
                files_deployed=$((files_deployed + 1))
            fi
        fi
    done
    
    # Process associated blockmap files
    for file in "$DIST_PATH"/*.blockmap; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            # Check if blockmap belongs to this platform
            if [[ "$filename" == *"$platform"* ]] || [[ "$platform" == "win" && "$filename" != *"mac"* && "$filename" != *"linux"* ]]; then
                echo "  Found blockmap: $filename"
                
                if [ "$TEST_MODE" = false ]; then
                    if scp "$file" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/$platform/" 2>/dev/null; then
                        echo "    ✅ Blockmap uploaded"
                    else
                        echo "    ⚠️ Blockmap upload failed (non-critical)"
                    fi
                else
                    echo "    📝 Would upload blockmap to $platform/"
                fi
            fi
        fi
    done
    
    if [ $files_found -gt 0 ]; then
        echo -e "${GREEN}✅ $description: $files_deployed/$files_found files processed${NC}"
    else
        echo -e "${YELLOW}⚠️ No $description files found${NC}"
    fi
    echo ""
}

# Deploy platform-specific files
deploy_platform "win" "*.exe" "Windows"
deploy_platform "mac" "*.dmg" "macOS DMG"
deploy_platform "mac" "*.zip" "macOS ZIP"  
deploy_platform "linux" "*.AppImage" "Linux AppImage"
deploy_platform "linux" "*.deb" "Linux DEB"
deploy_platform "linux" "*.rpm" "Linux RPM"

# Deploy update metadata files (latest.yml, etc.)
echo -e "${YELLOW}📄 Processing update metadata...${NC}"
metadata_found=0
metadata_deployed=0

for file in "$DIST_PATH"/latest*.yml; do
    if [ -f "$file" ]; then
        metadata_found=$((metadata_found + 1))
        local filename=$(basename "$file")
        echo "  Found: $filename"
        
        if [ "$TEST_MODE" = false ]; then
            if scp "$file" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/" 2>/dev/null; then
                metadata_deployed=$((metadata_deployed + 1))
                echo "    ✅ Uploaded successfully"
            else
                echo "    ❌ Upload failed"
            fi
        else
            echo "    📝 Would upload to root"
            metadata_deployed=$((metadata_deployed + 1))
        fi
    fi
done

if [ $metadata_found -gt 0 ]; then
    echo -e "${GREEN}✅ Metadata: $metadata_deployed/$metadata_found files processed${NC}"
else
    echo -e "${RED}❌ No metadata files found (latest*.yml)${NC}"
    echo -e "${YELLOW}This might prevent auto-updates from working properly${NC}"
fi
echo ""

# Set proper permissions on server
if [ "$TEST_MODE" = false ]; then
    echo -e "${YELLOW}🔧 Setting proper permissions...${NC}"
    ssh "$SERVER_USER@$SERVER_HOST" "
        sudo chown -R www-data:www-data $SERVER_PATH &&
        sudo chmod -R 755 $SERVER_PATH &&
        echo 'Permissions updated successfully'
    " || {
        echo -e "${YELLOW}⚠️ Permission update failed (may not be critical)${NC}"
    }
fi

# Deployment summary
echo ""
echo -e "${BLUE}================================${NC}"
if [ "$TEST_MODE" = true ]; then
    echo -e "${GREEN}✅ Test completed successfully!${NC}"
else
    echo -e "${GREEN}✅ Deployment completed!${NC}"
fi
echo -e "${BLUE}🔗 Update server: https://$SERVER_HOST/auto-updates/${NC}"
echo ""

# Test the deployment (skip in test mode)
if [ "$TEST_MODE" = false ]; then
    echo -e "${YELLOW}🧪 Testing update endpoint...${NC}"
    
    # Test main endpoint
    if curl -s -I "https://$SERVER_HOST/auto-updates/" 2>/dev/null | grep -q "200 OK"; then
        echo -e "${GREEN}✅ Update endpoint is accessible${NC}"
        
        # Test for latest.yml specifically  
        if curl -s -I "https://$SERVER_HOST/auto-updates/latest.yml" 2>/dev/null | grep -q "200 OK"; then
            echo -e "${GREEN}✅ Update metadata is accessible${NC}"
        else
            echo -e "${YELLOW}⚠️ latest.yml not found - Windows updates may not work${NC}"
        fi
        
        # Test for blockmap files
        if curl -s "https://$SERVER_HOST/auto-updates/" 2>/dev/null | grep -q "blockmap"; then
            echo -e "${GREEN}✅ Blockmap files detected (delta updates enabled)${NC}"
        else
            echo -e "${YELLOW}⚠️ No blockmap files found - full downloads only${NC}"
        fi
        
    else
        echo -e "${RED}❌ Update endpoint not accessible${NC}"
        echo -e "${YELLOW}Please check:${NC}"
        echo "  1. Nginx configuration"
        echo "  2. SSL certificates"  
        echo "  3. DNS settings"
        echo "  4. Firewall rules"
    fi
fi

# Final summary
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo "  App Version: $APP_VERSION"
echo "  Target Path: $SERVER_PATH"
echo "  Update URL: https://$SERVER_HOST/auto-updates/"
echo ""

if [ "$TEST_MODE" = true ]; then
    echo -e "${CYAN}To perform actual deployment, run:${NC}"
    echo "  npm run deploy:updates"
else
    echo -e "${GREEN}🎉 Ready! Test auto-update by running an older version of your app${NC}"
    echo ""
    echo -e "${CYAN}Useful commands:${NC}"
    echo "  npm run update:check     # Check if update server is accessible"
    echo "  npm run update:verify    # Verify update metadata files"
fi