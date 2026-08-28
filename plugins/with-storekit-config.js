const fs = require('node:fs');
const path = require('node:path');

const { withDangerousMod } = require('@expo/config-plugins');

const STOREKIT_REFERENCE = [
  '      <StoreKitConfigurationFileReference',
  '         identifier = "../Configuration.storekit">',
  '      </StoreKitConfigurationFileReference>',
].join('\n');

function addStoreKitReference(scheme) {
  if (scheme.includes('<StoreKitConfigurationFileReference')) return scheme;
  if (!scheme.includes('</LaunchAction>')) {
    throw new Error('Unable to find LaunchAction in the generated Xcode scheme');
  }
  return scheme.replace('</LaunchAction>', `${STOREKIT_REFERENCE}\n   </LaunchAction>`);
}

module.exports = (config) =>
  withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      const { projectRoot, platformProjectRoot } = modConfig.modRequest;
      const source = path.join(projectRoot, 'Configuration.storekit');
      const destination = path.join(platformProjectRoot, 'Configuration.storekit');

      if (!fs.existsSync(source)) {
        throw new Error(`Missing StoreKit configuration: ${source}`);
      }
      fs.copyFileSync(source, destination);

      const project = fs.readdirSync(platformProjectRoot).find((name) => name.endsWith('.xcodeproj'));
      if (!project) throw new Error('Unable to find the generated iOS Xcode project');

      const schemesDir = path.join(platformProjectRoot, project, 'xcshareddata', 'xcschemes');
      const schemes = fs.readdirSync(schemesDir).filter((name) => name.endsWith('.xcscheme'));
      if (schemes.length === 0) throw new Error('Unable to find a generated shared Xcode scheme');

      for (const schemeName of schemes) {
        const schemePath = path.join(schemesDir, schemeName);
        const scheme = fs.readFileSync(schemePath, 'utf8');
        fs.writeFileSync(schemePath, addStoreKitReference(scheme));
      }

      return modConfig;
    },
  ]);

module.exports.addStoreKitReference = addStoreKitReference;
