```
Microsoft Windows [Version 10.0.19045.6332]
(c) Microsoft Corporation. All rights reserved.

D:\VScode\GitHub\Hektos\meeto-admin>tree /F
Folder PATH listing for volume New Volume
Volume serial number is C0FE-B29F        
D:.
│   .env
│   .env.template
│   .firebaserc
│   .gitignore
│   eslint.config.js      
│   firebase.json
│   index.html
│   package.json
│   pnpm-lock.yaml        
│   postcss.config.js     
│   README.md
│   tailwind.config.js    
│   tsconfig.json
│   vite.config.ts        
│
├───public
│       404.html
│       demo_logo.png     
│       favicon.ico       
│       manifest.json     
│       robots.txt        
│
└───src
    │   App.tsx
    │   firebase_config.ts
    │   index.css
    │   main.tsx
    │   vite-env.d.ts
    │
    ├───collections
    │       demo.tsx
    │       products.tsx
    │
    └───lib
            imagekit-auth.ts
            imagekit.ts
```

D:\VScode\GitHub\Hektos\meeto-admin>
app.tsx
```
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
```
firecnfg
```
export const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  projectNumber: import.meta.env.VITE_FIREBASE_PROJECT_NUMBER,
  version: import.meta.env.VITE_FIREBASE_VERSION,
}
```
imgkit
```
import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY!,
  privateKey: import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT!,
});

```
priduct.tsx
```
import { buildCollection, buildProperty } from "@firecms/core";

export type Product = {
    name: string;
    image: string;
    price: number;
    description: string;
    discountPercentage: number;
    listProduct: boolean;
    isFeaturedProduct: boolean;
    topCategories: boolean;
    isTrendingProduct: boolean;
    isLeatestProduct: boolean;
    stockLevel: number;
    category: string;
};

export const productsCollection = buildCollection<Product>({
    name: "Products",
    singularName: "Product",
    id: "products",
    path: "products",
    icon: "ShoppingCart",
    group: "E-commerce",
    permissions: () => ({
        read: true,
        edit: true,
        create: true,
        delete: true
    }),
    properties: {
        name: {
            name: "Name",
            dataType: "string",
            validation: { required: true }
        },
        // 🔗 ImageKit integrated upload field
        image: buildProperty({
            name: "Product Image",
            dataType: "string",
            storage: {
                storagePath: "images/products",
                acceptedFiles: ["image/*"],

                // 🚀 Upload file to ImageKit
                uploadFunction: async (file: File) => {
                    try {
                        // Step 1: Get ImageKit authentication from your API route
                        const authRes = await fetch("/api/imagekit-auth");
                        const authData = await authRes.json();

                        // Step 2: Prepare form data for upload
                        const formData = new FormData();
                        formData.append("file", file);
                        formData.append("publicKey", import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY!);
                        formData.append("signature", authData.signature);
                        formData.append("expire", authData.expire.toString());
                        formData.append("token", authData.token);
                        formData.append("folder", "/products");

                        // Step 3: Upload directly to ImageKit
                        const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
                            method: "POST",
                            body: formData
                        });

                        const data = await uploadRes.json();

                        // Step 4: Return the uploaded image URL to FireCMS
                        return data.url;
                    } catch (error) {
                        console.error("ImageKit upload failed:", error);
                        throw new Error("Upload failed. Please try again.");
                    }
                }
            },
            description: "Upload an image of the product"
        }),
        price: {
            name: "Price",
            dataType: "number",
            validation: { required: true, min: 0 },
            description: "Price in USD"
        },
        description: {
            name: "Description",
            dataType: "string",
            multiline: true,
            validation: { max: 150 }
        },
        discountPercentage: {
            name: "Discount (%)",
            dataType: "number",
            validation: { min: 0, max: 100 }
        },
        listProduct: {
            name: "Shop List Product",
            dataType: "boolean"
        },
        isFeaturedProduct: {
            name: "Featured Product",
            dataType: "boolean"
        },
        topCategories: {
            name: "Top Categories",
            dataType: "boolean"
        },
        isTrendingProduct: {
            name: "Trending Product",
            dataType: "boolean"
        },
        isLeatestProduct: {
            name: "Latest Product",
            dataType: "boolean"
        },
        stockLevel: {
            name: "Stock Level",
            dataType: "number",
            validation: { min: 0 }
        },
        category: {
            name: "Category",
            dataType: "string",
            validation: { required: true },
            enumValues: {
                Chair: "Chair",
                Sofa: "Sofa",
                Mobile: "Mobile",
                Unstiched: "Unstiched",
                Stiched: "Stiched",
                Watch: "Watch",
                Camera: "Camera",
                Handfree: "Handfree"
            }
        }
    }
});
```
need any thing else ?
tell me wht to do with img kit auth