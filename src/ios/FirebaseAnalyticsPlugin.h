#import <Cordova/CDV.h>
#import "AppDelegate.h"

@interface FirebaseAnalyticsPlugin : CDVPlugin

- (void)logEvent:(CDVInvokedUrlCommand *)command;
- (void)setUserId:(CDVInvokedUrlCommand *)command;
- (void)setUserProperty:(CDVInvokedUrlCommand *)command;
- (void)setEnabled:(CDVInvokedUrlCommand *)command;
- (void)setCurrentScreen:(CDVInvokedUrlCommand *)command;

@end
