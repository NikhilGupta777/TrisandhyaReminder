# S3 CORS Configuration Required for Audio Playback

## Issue
Audio files from S3 are failing to play in the browser with "NotSupportedError". This is due to missing CORS headers from your S3 bucket.

## Solution
You need to configure CORS on your S3 bucket. Here's how:

### AWS Console Method:
1. Go to AWS S3 Console
2. Select your bucket: `trisandhya`
3. Go to "Permissions" tab
4. Scroll to "Cross-origin resource sharing (CORS)"
5. Click "Edit"
6. Add this configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "Content-Length",
            "Content-Type",
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

### AWS CLI Method:
```bash
aws s3api put-bucket-cors --bucket trisandhya --cors-configuration file://cors-config.json
```

## Why This Is Needed
Browsers enforce CORS (Cross-Origin Resource Sharing) security policies. When your app tries to play audio from S3, the browser makes a request to S3. Without proper CORS headers, the browser blocks the audio from playing.

## After Configuration
Once CORS is configured, your audio files will play correctly in the media library and throughout the app.
