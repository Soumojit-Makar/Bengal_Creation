// middleware/upload.js
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const stream = require('stream');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Check if we're in a serverless environment
const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || 
                     process.env.VERCEL || 
                     process.env.NETLIFY;

// Memory storage for serverless (no file system writes)
const memoryStorage = multer.memoryStorage();

// Cloudinary storage configuration
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "uploads",
        format: async (req, file) => {
            const ext = path.extname(file.originalname).slice(1);
            const formatMap = {
                'jpg': 'jpg',
                'jpeg': 'jpeg',
                'png': 'png',
                'gif': 'gif',
                'pdf': 'pdf',
                'doc': 'doc',
                'docx': 'docx',
                'txt': 'txt',
                'mp4': 'mp4',
                'mp3': 'mp3'
            };
            return formatMap[ext.toLowerCase()] || 'raw';
        },
        public_id: (req, file) => {
            const name = path.parse(file.originalname).name;
            const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
            return `${Date.now()}_${cleanName}`;
        },
        resource_type: "auto"
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpg|png|jpeg|pdf|doc|docx|txt|gif|webp|mp4|mp3/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowed.test(file.mimetype);
    
    if (ext || mimeType) {
        cb(null, true);
    } else {
        cb(new Error("Only images, PDFs, documents, and media files are allowed"), false);
    }
};

// Create multer instances based on environment
const createUploadMiddleware = () => {
    // For serverless environments, use memory storage
    if (isServerless) {
        console.log('Running in serverless mode - using memory storage');
        return multer({ 
            storage: memoryStorage, 
            fileFilter,
            limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
        });
    }
    
    // For traditional environments, try to use disk storage
    try {
        const fs = require('fs');
        const uploadDir = path.join(__dirname, "..", "uploads");
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const diskStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, "uploads/");
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname));
            }
        });
        
        return multer({ 
            storage: diskStorage, 
            fileFilter,
            limits: { fileSize: 10 * 1024 * 1024 }
        });
    } catch (error) {
        console.log('Disk storage not available, falling back to memory storage:', error.message);
        return multer({ 
            storage: memoryStorage, 
            fileFilter,
            limits: { fileSize: 10 * 1024 * 1024 }
        });
    }
};

// Create the appropriate upload middleware
const upload = createUploadMiddleware();

// Upload buffer directly to Cloudinary (for serverless environments)
const uploadBufferToCloudinary = (buffer, originalname, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: options.folder || "uploads",
                resource_type: "auto",
                public_id: `${Date.now()}_${path.parse(originalname).name.replace(/[^a-zA-Z0-9]/g, '_')}`,
                tags: options.tags || [],
                ...options
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    resolve({
                        fileId: result.public_id,
                        fileName: result.original_filename,
                        url: result.secure_url,
                        thumbnailUrl: result.resource_type === 'image' 
                            ? result.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fill/')
                            : null,
                        format: result.format,
                        size: result.bytes,
                        width: result.width,
                        height: result.height,
                        resourceType: result.resource_type,
                        createdAt: result.created_at,
                        cloudinary: result
                    });
                }
            }
        );

        uploadStream.end(buffer);
    });
};

// Cloudinary-only upload middleware (works in all environments)
const cloudinaryOnlyMiddleware = (req, res, next) => {
    // Use multer with memory storage
    const memoryUpload = multer({ 
        storage: memoryStorage, 
        fileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }
    }).single('file');

    memoryUpload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ 
                success: false,
                error: err.message 
            });
        }

        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: "No file uploaded" 
            });
        }

        try {
            // Upload buffer directly to Cloudinary
            const result = await uploadBufferToCloudinary(
                req.file.buffer,
                req.file.originalname,
                {
                    folder: req.body.folder || "uploads",
                    tags: req.body.tags ? req.body.tags.split(',') : []
                }
            );
            
            req.cloudinaryFile = result;
            next();
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Failed to upload to Cloudinary',
                details: error.message 
            });
        }
    });
};

// Multiple files upload to Cloudinary
const cloudinaryMultipleMiddleware = (req, res, next) => {
    const memoryUpload = multer({ 
        storage: memoryStorage, 
        fileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }
    }).array('files', 10);

    memoryUpload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ 
                success: false,
                error: err.message 
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false,
                error: "No files uploaded" 
            });
        }

        try {
            // Upload all files to Cloudinary
            const uploadPromises = req.files.map(file => 
                uploadBufferToCloudinary(
                    file.buffer,
                    file.originalname,
                    {
                        folder: req.body.folder || "uploads",
                        tags: req.body.tags ? req.body.tags.split(',') : []
                    }
                )
            );
            
            req.cloudinaryFiles = await Promise.all(uploadPromises);
            next();
        } catch (error) {
            console.error('Cloudinary multiple upload error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Failed to upload files to Cloudinary',
                details: error.message 
            });
        }
    });
};

// Check Cloudinary account usage/storage
const checkCloudinaryUsage = async () => {
    try {
        const result = await cloudinary.api.usage();
        return {
            plan: result.plan,
            credits: {
                used: result.credits.usage,
                limit: result.credits.limit,
                percentage: ((result.credits.usage / result.credits.limit) * 100).toFixed(2)
            },
            storage: {
                used: result.storage.usage,
                limit: result.storage.limit,
                percentage: ((result.storage.usage / result.storage.limit) * 100).toFixed(2)
            },
            bandwidth: {
                used: result.bandwidth.usage,
                limit: result.bandwidth.limit,
                percentage: ((result.bandwidth.usage / result.bandwidth.limit) * 100).toFixed(2)
            }
        };
    } catch (error) {
        console.error('Error checking Cloudinary usage:', error);
        return null;
    }
};

// Function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId, options = {}) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: options.resource_type || "image",
            ...options
        });
        return { 
            success: result.result === 'ok', 
            message: `File ${result.result === 'ok' ? 'deleted' : 'not found'}`,
            result 
        };
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

// Function to get file details from Cloudinary
const getCloudinaryFile = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return {
            publicId: result.public_id,
            url: result.secure_url,
            format: result.format,
            size: result.bytes,
            width: result.width,
            height: result.height,
            resourceType: result.resource_type,
            createdAt: result.created_at,
            tags: result.tags
        };
    } catch (error) {
        console.error('Error getting file from Cloudinary:', error);
        throw error;
    }
};

// Function to list files from Cloudinary
const listCloudinaryFiles = async (options = {}) => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: options.folder || '',
            max_results: options.limit || 10,
            next_cursor: options.cursor || null,
            resource_type: options.resource_type || 'image'
        });

        return {
            files: result.resources.map(resource => ({
                publicId: resource.public_id,
                url: resource.secure_url,
                format: resource.format,
                size: resource.bytes,
                width: resource.width,
                height: resource.height,
                resourceType: resource.resource_type,
                createdAt: resource.created_at,
                tags: resource.tags
            })),
            nextCursor: result.next_cursor
        };
    } catch (error) {
        console.error('Error listing Cloudinary files:', error);
        throw error;
    }
};

// Function to generate transformed URL
const getTransformedUrl = (publicId, transformations = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        ...transformations
    });
};

// Export all functionality
module.exports = {
    // Basic upload (works in all environments - uses Cloudinary directly)
    upload: cloudinaryOnlyMiddleware,
    
    // Cloudinary-only upload (explicit)
    cloudinaryUpload: cloudinaryOnlyMiddleware,
    
    // Cloudinary multiple files upload
    cloudinaryMultipleUpload: cloudinaryMultipleMiddleware,
    
    // Direct upload functions
    cloudinaryDirect: {
        upload: uploadBufferToCloudinary,
        delete: deleteFromCloudinary,
        get: getCloudinaryFile,
        list: listCloudinaryFiles,
        getTransformedUrl,
        checkUsage: checkCloudinaryUsage
    },
    
    // Original file filter
    fileFilter,
    
    // Utility to check environment
    isServerless,
    
    // Memory storage (for custom implementations)
    memoryStorage
};