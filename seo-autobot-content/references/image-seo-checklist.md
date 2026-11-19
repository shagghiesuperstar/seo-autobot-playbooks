---
name: image-seo-checklist
description: "Use when auditing, briefing, or optimizing the images on a page for search: filenames, compression, alt text, schema, originality, and captions."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Image SEO checklist"
  source_path: "search-ops/image-seo-checklist/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

# Image SEO checklist

Go through each image on the page, or each image a brief calls for, and check it against these points. Report what passes, what fails, and the fix for each one. Never invent file sizes or scores; measure them or say they weren't measured.

1. **Descriptive filename.** Use short, plain words joined by hyphens that say what the image shows, like `red-trail-running-shoe-side.jpg`, not `IMG_0042.jpg`. Translate filenames when the image is localized.
2. **Compress.** Make the file as small as it can be without visible loss. Prefer WebP or AVIF, size it to the width it actually displays at, and set width and height so the layout doesn't shift as it loads.
3. **Relevant alt text.** Describe what the image shows and why it's on the page, and use the page's target term only where it fits naturally. Don't stuff keywords. Decorative images get an empty `alt=""`.
4. **ImageObject schema.** Add ImageObject structured data where it helps, especially for product, licensed, or key editorial images, with the image URL, caption, and creator or license where known. Point the page's preferred preview image at a representative image, not the logo.
5. **Unique images.** Use original photos, screenshots, or diagrams rather than stock where you can. Flag stock images that appear on competing pages.
6. **Captions.** Add captions where they clarify context. Readers scan captions, and they give search engines more context about the image and the page. Keep each image near the text it supports.

Also check:
- Images are real `<img>` elements with a `src`. Google doesn't index CSS background images.
- Images below the fold are lazy-loaded, and the main above-the-fold image is not.
