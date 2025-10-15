import { useCallback, useMemo } from "react";

import {
    AppBar,
    Authenticator,
    CircularProgressCenter,
    Drawer,
    FireCMS,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController,
    useValidateAuthenticator
} from "@firecms/core";

import {
    FirebaseAuthController,
    FirebaseLoginView,
    FirebaseSignInProvider,
    FirebaseUserWrapper,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDelegate,
    useInitialiseFirebase,
} from "@firecms/firebase";

import { CenteredView } from "@firecms/ui";

// 👇 Replace demo with your own collection
import { productsCollection } from "./collections/products";

import { firebaseConfig } from "./firebase_config";

function App() {

    // Authentication logic (you can customize this later)
    const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
        user,
    }) => {

        if (user?.email?.includes("flanders")) {
            throw Error("Stupid Flanders!");
        }

        console.log("Allowing access to", user);

        // Allow all users for now
        return true;
    }, []);

    // 👇 Add your collection here
    const collections = useMemo(() => [
        productsCollection
    ], []);

    // Initialize Firebase
    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig
    });

    // Dark/light mode controller
    const modeController = useBuildModeController();

    const signInOptions: FirebaseSignInProvider[] = ["google.com", "password"];

    // Firebase auth controller
    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions
    });

    // Save user preferences locally
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    // Firestore data delegate
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp
    });

    // Storage source (for images, files, etc.)
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    // Validate authentication
    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        authController,
        authenticator: myAuthenticator,
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    // Navigation controller
    const navigationController = useBuildNavigationController({
        disabled: authLoading,
        collections,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    // Handle loading and errors
    if (firebaseConfigLoading || !firebaseApp) {
        return <CircularProgressCenter />;
    }

    if (configError) {
        return <CenteredView>{configError}</CenteredView>;
    }

    // Main UI
    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>
                <FireCMS
                    navigationController={navigationController}
                    authController={authController}
                    userConfigPersistence={userConfigPersistence}
                    dataSourceDelegate={firestoreDelegate}
                    storageSource={storageSource}
                >
                    {({ loading }) => {

                        if (loading || authLoading) {
                            return <CircularProgressCenter size={"large"} />;
                        }

                        if (!canAccessMainView) {
                            return (
                                <FirebaseLoginView
                                    authController={authController}
                                    firebaseApp={firebaseApp}
                                    signInOptions={signInOptions}
                                    notAllowedError={notAllowedError}
                                />
                            );
                        }

                        return (
                            <Scaffold autoOpenDrawer={false}>
                                <AppBar title={"Meeto Admin Dashboard"} />
                                <Drawer />
                                <NavigationRoutes />
                                <SideDialogs />
                            </Scaffold>
                        );
                    }}
                </FireCMS>
            </ModeControllerProvider>
        </SnackbarProvider>
    );
}

export default App;
