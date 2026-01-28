import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function uploadToCloudinary(file: File, folder: string = "saraban-docs"): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate random filename
    const { randomBytes } = await import('crypto');
    const uniqueName = randomBytes(16).toString('hex');

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                folder: folder,
                public_id: uniqueName, // Use random name
                use_filename: false,   // Don't use original filename
                unique_filename: false // We already handled uniqueness
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                } else {
                    resolve(result?.secure_url || "");
                }
            }
        ).end(buffer);
    });
}
