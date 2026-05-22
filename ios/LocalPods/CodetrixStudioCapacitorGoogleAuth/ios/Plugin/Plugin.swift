import Foundation
import Capacitor
import GoogleSignIn

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitor.ionicframework.com/docs/plugins/ios
 */
@objc(GoogleAuth)
public class GoogleAuth: CAPPlugin {
    var signInCall: CAPPluginCall!
    var googleSignIn: GIDSignIn!;
    var googleSignInConfiguration: GIDConfiguration!;
    var forceAuthCode: Bool = false;
    var additionalScopes: [String]!;

    
    public override func load() {
        googleSignIn = GIDSignIn.sharedInstance;
        
        let serverClientId = getServerClientIdValue();
        
        guard let clientId = getClientIdValue() else {
            NSLog("no client id found in config")
            return;
        }

        googleSignInConfiguration = GIDConfiguration.init(clientID: clientId, serverClientID: serverClientId)
        googleSignIn.configuration = googleSignInConfiguration
        
        // these are scopes granted by default by the signIn method
        let defaultGrantedScopes = ["email", "profile", "openid"];

        // these are scopes we will need to request after sign in
        additionalScopes = (getConfigValue("scopes") as? [String] ?? []).filter {
            return !defaultGrantedScopes.contains($0);
        };
                
        if let forceAuthCodeConfig = getConfigValue("forceCodeForRefreshToken") as? Bool {
            forceAuthCode = forceAuthCodeConfig;
        }

        NotificationCenter.default.addObserver(self, selector: #selector(handleOpenUrl(_ :)), name: Notification.Name(Notification.Name.capacitorOpenURL.rawValue), object: nil);
    }

    @objc
    func initialize(_ call: CAPPluginCall) {
        call.resolve();
    }

    @objc
    func signIn(_ call: CAPPluginCall) {
        signInCall = call;
        DispatchQueue.main.async(execute: {
            if self.googleSignIn.hasPreviousSignIn() && !self.forceAuthCode {
                self.googleSignIn.restorePreviousSignIn() { user, error in
                    if let error = error {
                        self.signInCall?.reject(error.localizedDescription);
                        return;
                    }
                    guard let user = user else {
                        self.signInCall?.reject("Google Sign-In did not return a user.");
                        return;
                    }
                    self.resolveSignInCallWith(user: user, serverAuthCode: nil)
                }
            } else {
                let presentingVc = self.bridge!.viewController!;
                
                self.googleSignIn.signIn(withPresenting: presentingVc, hint: nil, additionalScopes: self.additionalScopes) { signInResult, error in
                    if let error = error {
                        self.signInCall?.reject(error.localizedDescription, "\(error._code)");
                        return;
                    }
                    guard let signInResult = signInResult else {
                        self.signInCall?.reject("Google Sign-In did not return a result.");
                        return;
                    }
                    self.resolveSignInCallWith(user: signInResult.user, serverAuthCode: signInResult.serverAuthCode);
                };
            }
        })
    }

    @objc
    func refresh(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.googleSignIn.currentUser == nil {
                call.reject("User not logged in.");
                return
            }
            self.googleSignIn.currentUser!.refreshTokensIfNeeded { (user, error) in
                guard let user = user else {
                    call.reject(error?.localizedDescription ?? "Something went wrong.");
                    return;
                }
                let authenticationData: [String: Any] = [
                    "accessToken": user.accessToken.tokenString,
                    "idToken": user.idToken?.tokenString ?? NSNull(),
                    "refreshToken": user.refreshToken.tokenString
                ]
                call.resolve(authenticationData);
            }
        }
    }

    @objc
    func signOut(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.googleSignIn.signOut();
        }
        call.resolve();
    }

    @objc
    func handleOpenUrl(_ notification: Notification) {
        guard let object = notification.object as? [String: Any] else {
            print("There is no object on handleOpenUrl");
            return;
        }
        guard let url = object["url"] as? URL else {
            print("There is no url on handleOpenUrl");
            return;
        }
        googleSignIn.handle(url);
    }
    
    
    func getClientIdValue() -> String? {
        if let clientId = getConfigValue("iosClientId") as? String {
            return clientId;
        }
        else if let clientId = getConfigValue("clientId") as? String {
            return clientId;
        }
        else if let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
                let dict = NSDictionary(contentsOfFile: path) as? [String: AnyObject],
                let clientId = dict["CLIENT_ID"] as? String {
            return clientId;
        }
        return nil;
    }
    
    func getServerClientIdValue() -> String? {
        if let serverClientId = getConfigValue("serverClientId") as? String {
            return serverClientId;
        }
        return nil;
    }

    func resolveSignInCallWith(user: GIDGoogleUser, serverAuthCode: String?) {
        var userData: [String: Any] = [
            "authentication": [
                "accessToken": user.accessToken.tokenString,
                "idToken": user.idToken?.tokenString ?? NSNull(),
                "refreshToken": user.refreshToken.tokenString
            ],
            "serverAuthCode": serverAuthCode ?? NSNull(),
            "email": user.profile?.email ?? NSNull(),
            "familyName": user.profile?.familyName ?? NSNull(),
            "givenName": user.profile?.givenName ?? NSNull(),
            "id": user.userID ?? NSNull(),
            "name": user.profile?.name ?? NSNull()
        ];
        if let imageUrl = user.profile?.imageURL(withDimension: 100)?.absoluteString {
            userData["imageUrl"] = imageUrl;
        }
        signInCall?.resolve(userData);
    }
}
