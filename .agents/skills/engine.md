---
name: Content Automation & Image Engine
description: Blueprints to enhance Gemini outputs, add multi-channel support, and generate social images
---

# 1. Image Generation Integration
*   **Provider**: To keep billing and infrastructure light, integrate an image generation API endpoint (`/app/api/generate-image/route.ts`). You can use a free/affordable provider API (like Pollinations.ai or highly-efficient models via Replicate/Hugging Face).
*   **Flow**: Next to the blog content, offer a "Generate Featured Image" button. Once selected, Gemini will auto-generate an optimized image prompt, run it through the API, and save the resultant CDN image URL directly into the asset database.

# 2. Expanding Social Distribution Channels
*   **Current State**: Multi-text output for LinkedIn and X (Twitter).
*   **Desired Future State**:
    *   **X (Twitter)**: Text (up to 280 characters) + direct image generation attachment.
    *   **LinkedIn**: Professional post markup with an attached feature image.
    *   **Instagram/Facebook**: Highly engaging visually-focused captions with visual image generator placement.
*   **The Schema**: Update the AI API prompt output so it responds with:
    ```json
    {
      "blog": { "title": "...", "content_html": "..." },
      "social_posts": {
        "x": { "text": "...", "image_prompt": "..." },
        "linkedin": { "text": "...", "image_prompt": "..." },
        "instagram": { "caption": "...", "image_prompt": "..." }
      }
    }
    ```

# 3. Codebase Error Auditing
Before writing any code:
1. Scan the browser console and terminal logs for compilation warnings.
2. Resolve Tailwind conflicts causing overlapping items in dashboard cards or navigation sidebars.
3. Fix dynamic routing bugs (`params` issues on static templates) that can halt the application build.