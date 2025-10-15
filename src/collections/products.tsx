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
                        const formData = new FormData();
                        formData.append("file", file);
                        formData.append("fileName", file.name);

                        const res = await fetch(
                            "https://upload.imagekit.io/api/v1/files/upload?publicKey=" +
                            import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY!,
                            {
                                method: "POST",
                                body: formData,
                            }
                        );

                        const data = await res.json();
                        if (!data.url) throw new Error("Upload failed");
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
