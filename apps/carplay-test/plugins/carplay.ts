import {
  ConfigPlugin,
  IOSConfig,
  createRunOncePlugin,
  withPlugins,
  withDangerousMod,
} from "@expo/config-plugins";

import * as fs from "fs/promises";

export const withCarPlay: ConfigPlugin = (config) => {
  config = withCarPlayAppDelegate(config);
  config = withCarPlayAppDelegateHeader(config);
  return config;
};

export const withCarPlayAppDelegate: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const fileInfo = IOSConfig.Paths.getAppDelegate(
        config.modRequest.projectRoot
      );
      let contents = await fs.readFile(fileInfo.path, "utf-8");
      if (fileInfo.language === "objcpp" || fileInfo.language === "objc") {
        contents = modifySourceFile(contents);
      } else {
        throw new Error(
          `Cannot add Intercom code to AppDelegate of language "${fileInfo.language}"`
        );
      }
      await fs.writeFile(fileInfo.path, contents);
      return config;
    },
  ]);
};

export const withCarPlayAppDelegateHeader: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const headerFilePath = IOSConfig.Paths.getAppDelegateHeaderFilePath(
        config.modRequest.projectRoot
      );
      let contents = await fs.readFile(headerFilePath, "utf-8");

      contents = modifyHeaderFile(contents);

      await fs.writeFile(headerFilePath, contents);
      return config;
    },
  ]);
};

const modifyHeaderFile = (contents: string): string => {
  contents = `#import <CarPlay/CarPlay.h>\n${contents}`;

  contents = contents.replace(
    /@interface AppDelegate\s?:\s?EXAppDelegateWrapper\s?<(.*?)>/,
    (a, b) =>
      `@interface AppDelegate : EXAppDelegateWrapper <${b}, CPApplicationDelegate>`
  );

  return contents;
};

const newMethods = `
- (void)application:(UIApplication *)application didConnectCarInterfaceController:(CPInterfaceController *)interfaceController toWindow:(CPWindow *)window {
  [RNCarPlay connectWithInterfaceController:interfaceController window:window];
}

- (void)application:(nonnull UIApplication *)application didDisconnectCarInterfaceController:(nonnull CPInterfaceController *)interfaceController fromWindow:(nonnull CPWindow *)window {
  [RNCarPlay disconnect];
}`;

const modifySourceFile = (contents: string): string => {
  contents = `#import <RNCarPlay.h>\n${contents}`;
  contents = contents.replace(/@end[\s\n]+?$/, `\n${newMethods}\n\n@end`);
  return contents;
};

const withCarPlayPlugin: ConfigPlugin = (config) => {
  config = withCarPlay(config);

  // Return the modified config.
  return config;
};

const pkg = {
  // Prevent this plugin from being run more than once.
  // This pattern enables users to safely migrate off of this
  // out-of-tree `@config-plugins/intercom-react-native` to a future
  // upstream plugin in `intercom-react-native`
  name: "@valtyr/react-native-carplay",
  // Indicates that this plugin is dangerously linked to a module,
  // and might not work with the latest version of that module.
  version: "UNVERSIONED",
};

export default createRunOncePlugin(withCarPlayPlugin, pkg.name, pkg.version);
