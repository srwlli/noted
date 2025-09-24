#!/usr/bin/env node

/**
 * PWA Validation Script for Expo React Native Web Apps
 *
 * Validates that the built PWA meets requirements for iOS/Android installation
 * and proper safe area handling.
 */

const fs = require('fs');
const path = require('path');

class PWAValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.distPath = path.join(process.cwd(), 'dist');
  }

  log(message, type = 'info') {
    const colors = {
      error: '\x1b[31m',
      warning: '\x1b[33m',
      success: '\x1b[32m',
      info: '\x1b[36m',
      reset: '\x1b[0m'
    };

    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  error(message) {
    this.errors.push(message);
    this.log(`❌ ${message}`, 'error');
  }

  warning(message) {
    this.warnings.push(message);
    this.log(`⚠️  ${message}`, 'warning');
  }

  success(message) {
    this.log(`✅ ${message}`, 'success');
  }

  // Check if dist directory exists
  validateBuildOutput() {
    this.log('\n📁 Checking build output...', 'info');

    if (!fs.existsSync(this.distPath)) {
      this.error('dist/ directory not found. Run "npm run build" first.');
      return false;
    }

    const requiredFiles = ['index.html', 'manifest.json'];
    let allExists = true;

    requiredFiles.forEach(file => {
      const filePath = path.join(this.distPath, file);
      if (fs.existsSync(filePath)) {
        this.success(`Found ${file}`);
      } else {
        this.error(`Missing required file: ${file}`);
        allExists = false;
      }
    });

    return allExists;
  }

  // Validate manifest.json
  validateManifest() {
    this.log('\n📋 Validating PWA manifest...', 'info');

    const manifestPath = path.join(this.distPath, 'manifest.json');

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // Required fields
      const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
      required.forEach(field => {
        if (manifest[field]) {
          this.success(`Manifest has ${field}`);
        } else {
          this.error(`Manifest missing required field: ${field}`);
        }
      });

      // Check display mode
      if (manifest.display === 'standalone') {
        this.success('Display mode set to standalone');
      } else {
        this.error(`Display mode is "${manifest.display}", should be "standalone"`);
      }

      // Check icons
      if (manifest.icons && manifest.icons.length > 0) {
        const has192 = manifest.icons.some(icon => icon.sizes.includes('192x192'));
        const has512 = manifest.icons.some(icon => icon.sizes.includes('512x512'));

        if (has192) this.success('Found 192x192 icon');
        else this.warning('Missing 192x192 icon');

        if (has512) this.success('Found 512x512 icon');
        else this.warning('Missing 512x512 icon');
      }

      // Check PWA-specific fields
      if (manifest.theme_color) this.success('Theme color defined');
      else this.warning('Theme color not defined');

      if (manifest.background_color) this.success('Background color defined');
      else this.warning('Background color not defined');

    } catch (error) {
      this.error(`Failed to parse manifest.json: ${error.message}`);
    }
  }

  // Validate index.html meta tags
  validateHTML() {
    this.log('\n📄 Validating HTML meta tags...', 'info');

    const htmlPath = path.join(this.distPath, 'index.html');

    try {
      const html = fs.readFileSync(htmlPath, 'utf8');

      // Required meta tags for PWA
      const requiredMeta = [
        'apple-mobile-web-app-capable',
        'apple-mobile-web-app-status-bar-style',
        'apple-mobile-web-app-title',
        'theme-color',
        'viewport'
      ];

      requiredMeta.forEach(meta => {
        if (html.includes(`name="${meta}"`)) {
          this.success(`Found meta tag: ${meta}`);
        } else {
          this.error(`Missing meta tag: ${meta}`);
        }
      });

      // Check viewport-fit=cover
      if (html.includes('viewport-fit=cover')) {
        this.success('Viewport includes viewport-fit=cover');
      } else {
        this.error('Viewport missing viewport-fit=cover (required for safe areas)');
      }

      // Check for safe area CSS
      if (html.includes('env(safe-area-inset')) {
        this.success('Safe area CSS environment variables found');
      } else {
        this.warning('Safe area CSS environment variables not found in HTML');
      }

    } catch (error) {
      this.error(`Failed to read index.html: ${error.message}`);
    }
  }

  // Check for common PWA files
  validatePWAFiles() {
    this.log('\n🔍 Checking PWA files...', 'info');

    // Check for service worker (optional but recommended)
    const swPath = path.join(this.distPath, 'sw.js');
    if (fs.existsSync(swPath)) {
      this.success('Service worker found');
    } else {
      this.warning('No service worker found (offline functionality limited)');
    }

    // Check for icon files
    const iconsDir = path.join(this.distPath, '_expo/static/media');
    if (fs.existsSync(iconsDir)) {
      this.success('Icon directory exists');

      const iconFiles = fs.readdirSync(iconsDir).filter(f =>
        f.includes('icon') && (f.endsWith('.png') || f.endsWith('.jpg'))
      );

      if (iconFiles.length > 0) {
        this.success(`Found ${iconFiles.length} icon files`);
      } else {
        this.warning('No icon files found in expected location');
      }
    }
  }

  // Validate source code for PWA best practices
  validateSourceCode() {
    this.log('\n💻 Checking source code patterns...', 'info');

    try {
      // Check for safe area usage in components
      const checkSafeAreaPattern = (filePath) => {
        if (!fs.existsSync(filePath)) return false;

        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes('env(safe-area-inset') ||
               content.includes('useSafeAreaInsets') ||
               content.includes('Platform.OS');
      };

      const componentsToCheck = [
        'components/common-header.tsx',
        'components/shared-page-layout.tsx',
        'app/(tabs)/_layout.tsx'
      ];

      componentsToCheck.forEach(component => {
        const fullPath = path.join(process.cwd(), component);
        if (checkSafeAreaPattern(fullPath)) {
          this.success(`${component} has safe area handling`);
        } else if (fs.existsSync(fullPath)) {
          this.warning(`${component} may be missing safe area handling`);
        }
      });

      // Check global.css for PWA utilities
      const globalCSSPath = path.join(process.cwd(), 'global.css');
      if (fs.existsSync(globalCSSPath)) {
        const css = fs.readFileSync(globalCSSPath, 'utf8');

        if (css.includes('env(safe-area-inset')) {
          this.success('Global CSS includes safe area utilities');
        } else {
          this.warning('Global CSS missing safe area utilities');
        }

        if (css.includes('display-mode: standalone')) {
          this.success('Global CSS includes standalone mode styles');
        } else {
          this.warning('Global CSS missing standalone mode detection');
        }
      }

      // Check app.json configuration
      const appConfigPath = path.join(process.cwd(), 'app.json');
      if (fs.existsSync(appConfigPath)) {
        const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));

        if (appConfig.expo?.web?.display === 'standalone') {
          this.success('app.json configured for standalone mode');
        } else {
          this.error('app.json not configured for standalone PWA mode');
        }
      }

    } catch (error) {
      this.warning(`Source code validation failed: ${error.message}`);
    }
  }

  // Run all validations
  validate() {
    this.log('🔍 Starting PWA validation...', 'info');

    if (!this.validateBuildOutput()) {
      return this.showResults();
    }

    this.validateManifest();
    this.validateHTML();
    this.validatePWAFiles();
    this.validateSourceCode();

    return this.showResults();
  }

  showResults() {
    this.log('\n📊 Validation Results:', 'info');
    this.log('='.repeat(50), 'info');

    if (this.errors.length === 0) {
      this.log('🎉 All critical PWA requirements met!', 'success');
    } else {
      this.log(`❌ ${this.errors.length} error(s) found:`, 'error');
      this.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      this.log(`⚠️  ${this.warnings.length} warning(s):`, 'warning');
      this.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
    }

    const isValid = this.errors.length === 0;

    this.log('\n📱 Next Steps:', 'info');
    if (isValid) {
      this.log('✅ PWA is ready for deployment!', 'success');
      this.log('📋 Test manually on iOS/Android devices', 'info');
      this.log('🚀 Deploy and test "Add to Home Screen"', 'info');
    } else {
      this.log('❌ Fix errors above before deploying', 'error');
      this.log('📋 Run validation again after fixes', 'info');
    }

    return isValid;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new PWAValidator();
  const isValid = validator.validate();
  process.exit(isValid ? 0 : 1);
}

module.exports = PWAValidator;