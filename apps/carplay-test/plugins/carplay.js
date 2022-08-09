"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.withCarPlayAppDelegateHeader = exports.withCarPlayAppDelegate = exports.withCarPlay = void 0;
var config_plugins_1 = require("@expo/config-plugins");
var fs = require("fs/promises");
var withCarPlay = function (config) {
    config = exports.withCarPlayAppDelegate(config);
    config = exports.withCarPlayAppDelegateHeader(config);
    return config;
};
exports.withCarPlay = withCarPlay;
var withCarPlayAppDelegate = function (config) {
    return config_plugins_1.withDangerousMod(config, [
        "ios",
        function (config) { return __awaiter(void 0, void 0, void 0, function () {
            var fileInfo, contents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileInfo = config_plugins_1.IOSConfig.Paths.getAppDelegate(config.modRequest.projectRoot);
                        return [4 /*yield*/, fs.readFile(fileInfo.path, "utf-8")];
                    case 1:
                        contents = _a.sent();
                        if (fileInfo.language === "objcpp" || fileInfo.language === "objc") {
                            contents = modifySourceFile(contents);
                        }
                        else {
                            throw new Error("Cannot add Intercom code to AppDelegate of language \"" + fileInfo.language + "\"");
                        }
                        return [4 /*yield*/, fs.writeFile(fileInfo.path, contents)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, config];
                }
            });
        }); },
    ]);
};
exports.withCarPlayAppDelegate = withCarPlayAppDelegate;
var withCarPlayAppDelegateHeader = function (config) {
    return config_plugins_1.withDangerousMod(config, [
        "ios",
        function (config) { return __awaiter(void 0, void 0, void 0, function () {
            var headerFilePath, contents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headerFilePath = config_plugins_1.IOSConfig.Paths.getAppDelegateHeaderFilePath(config.modRequest.projectRoot);
                        return [4 /*yield*/, fs.readFile(headerFilePath, "utf-8")];
                    case 1:
                        contents = _a.sent();
                        contents = modifyHeaderFile(contents);
                        return [4 /*yield*/, fs.writeFile(headerFilePath, contents)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, config];
                }
            });
        }); },
    ]);
};
exports.withCarPlayAppDelegateHeader = withCarPlayAppDelegateHeader;
var modifyHeaderFile = function (contents) {
    contents = "#import <CarPlay/CarPlay.h>\n" + contents;
    contents = contents.replace(/@interface AppDelegate\s?:\s?EXAppDelegateWrapper\s?<(.*?)>/, function (a, b) {
        return "@interface AppDelegate : EXAppDelegateWrapper <" + b + ", CPApplicationDelegate>";
    });
    return contents;
};
var newMethods = "\n- (void)application:(UIApplication *)application didConnectCarInterfaceController:(CPInterfaceController *)interfaceController toWindow:(CPWindow *)window {\n  [RNCarPlay connectWithInterfaceController:interfaceController window:window];\n}\n\n- (void)application:(nonnull UIApplication *)application didDisconnectCarInterfaceController:(nonnull CPInterfaceController *)interfaceController fromWindow:(nonnull CPWindow *)window {\n  [RNCarPlay disconnect];\n}";
var modifySourceFile = function (contents) {
    contents = "#import <RNCarPlay.h>\n" + contents;
    contents = contents.replace(/@end[\s\n]+?$/, "\n" + newMethods + "\n\n@end");
    return contents;
};
var withCarPlayPlugin = function (config) {
    config = exports.withCarPlay(config);
    // Return the modified config.
    return config;
};
var pkg = {
    // Prevent this plugin from being run more than once.
    // This pattern enables users to safely migrate off of this
    // out-of-tree `@config-plugins/intercom-react-native` to a future
    // upstream plugin in `intercom-react-native`
    name: "@valtyr/react-native-carplay",
    // Indicates that this plugin is dangerously linked to a module,
    // and might not work with the latest version of that module.
    version: "UNVERSIONED"
};
exports["default"] = config_plugins_1.createRunOncePlugin(withCarPlayPlugin, pkg.name, pkg.version);
