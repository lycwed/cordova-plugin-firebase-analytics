#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");

var config = fs.readFileSync("config.xml").toString();
var name = getValue(config, "name");

var FIREBASE_DIR = "resources/firebase";
var IOS_DIR = "platforms/ios";
var ANDROID_DIR = "platforms/android";
var STRING_XML_1 = ANDROID_DIR + "/app/src/main/res/values/strings.xml";
var STRING_XML_2 = ANDROID_DIR + "/res/values/strings.xml";

var PLATFORM = {
  IOS: {
    dest: IOS_DIR + "/" + name + "/Resources/GoogleService-Info.plist",
    src: FIREBASE_DIR + "/GoogleService-Info.plist"
  },
  ANDROID: {
    dest: ANDROID_DIR + "/google-services.json",
    src: FIREBASE_DIR + "/google-services.json",
    stringsXml: fileExists(STRING_XML_1) ? STRING_XML_1 : STRING_XML_2
  }
};

function updateStringsXml(contents) {
  var json = JSON.parse(contents);
  var strings = fs.readFileSync(PLATFORM.ANDROID.stringsXml).toString();

  // strip non-default value
  strings = strings.replace(
    new RegExp('<string name="google_app_id">([^@<]+?)</string>', "i"),
    ""
  );

  // strip non-default value
  strings = strings.replace(
    new RegExp('<string name="google_api_key">([^@<]+?)</string>', "i"),
    ""
  );

  // strip empty lines
  strings = strings.replace(
    new RegExp("(\r\n|\n|\r)[ \t]*(\r\n|\n|\r)", "gm"),
    "$1"
  );

  // replace the default value
  strings = strings.replace(
    new RegExp('<string name="google_app_id">([^<]+?)</string>', "i"),
    '<string name="google_app_id">' +
      json.client[0].client_info.mobilesdk_app_id +
      "</string>"
  );

  // replace the default value
  strings = strings.replace(
    new RegExp('<string name="google_api_key">([^<]+?)</string>', "i"),
    '<string name="google_api_key">' +
      json.client[0].api_key[0].current_key +
      "</string>"
  );

  fs.writeFileSync(PLATFORM.ANDROID.stringsXml, strings);
}

function copyKey(platform, callback) {
  var file = platform.src,
    destPath = platform.dest;

  if (fileExists(file)) {
    try {
      var contents = fs.readFileSync(file).toString();

      try {
        var folder = destPath.substring(0, destPath.lastIndexOf("/"));
        fs.ensureDirSync(folder);
        fs.writeFileSync(destPath, contents);
      } catch (err) {
        // skip
      }

      callback && callback(contents);
    } catch (err) {
      console.log("copyKey error", err);
    }
  }
}

function getValue(config, name) {
  var value = config.match(
    new RegExp("<" + name + ">(.*?)</" + name + ">", "i")
  );
  if (value && value[1]) {
    return value[1];
  } else {
    return null;
  }
}

function fileExists(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
}

function directoryExists(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

module.exports = function(context) {
  //get platform from the context supplied by cordova
  var platforms = context.opts.platforms;
  // Copy key files to their platform specific folders
  if (platforms.indexOf("ios") !== -1 && directoryExists(IOS_DIR)) {
    console.log("Preparing Firebase on iOS");
    copyKey(PLATFORM.IOS);
  }
  if (platforms.indexOf("android") !== -1 && directoryExists(ANDROID_DIR)) {
    console.log("Preparing Firebase on Android");
    copyKey(PLATFORM.ANDROID, updateStringsXml);
  }
};
