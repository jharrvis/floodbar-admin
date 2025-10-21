# Public Assets Directory

This directory contains static files that are publicly accessible from your website.

## Directory Structure

### `/images`
Place all image files here (JPG, PNG, GIF, WebP, SVG, etc.)
- Product images
- Hero images
- Logo and branding
- Testimonial photos
- News thumbnails

**Usage in code:**
```jsx
<img src="/images/your-image.jpg" alt="Description" />
```

### `/videos`
Place all video files here (MP4, WebM, etc.)
- Product demonstration videos
- Tutorial videos
- Promotional videos

**Usage in code:**
```jsx
<video src="/videos/your-video.mp4" controls />
```

### `/media`
Place other media files here
- PDF documents
- Downloadable files
- Brochures
- Documentation

**Usage in code:**
```jsx
<a href="/media/brochure.pdf" download>Download Brochure</a>
```

## Important Notes

1. **File Naming:** Use lowercase and hyphens (e.g., `floodbar-product-1.jpg`)
2. **Optimization:** Compress images before uploading to improve load times
3. **Size Limits:** Keep individual files under 10MB for better performance
4. **Formats:**
   - Images: JPG, PNG, WebP (WebP recommended for better compression)
   - Videos: MP4 (H.264 codec recommended for compatibility)

## Access URLs

All files in this directory are accessible at:
- `https://yourdomain.com/images/filename.jpg`
- `https://yourdomain.com/videos/filename.mp4`
- `https://yourdomain.com/media/filename.pdf`

In development:
- `http://localhost:3000/images/filename.jpg`
