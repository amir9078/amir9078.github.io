GALLERY IMAGES
==============

Drop your photos in this folder (e.g. talk.jpg, dashboard.png, certificate.jpg).
Recommended: landscape ~1200x900px, optimised JPG/PNG/WebP, under ~300KB each.

Then, in index.html, find the "Gallery" section and replace a placeholder tile:

    <button class="gtile ph reveal" ...>...</button>

with a real image tile (this also enables the click-to-zoom lightbox):

    <button class="gtile reveal" data-d="1" data-full="assets/gallery/talk.jpg">
      <img src="assets/gallery/talk.jpg" alt="Speaking at a data & AI meetup in Dubai" loading="lazy">
    </button>

- data-full = the large image shown in the lightbox (can be a higher-res version).
- alt      = a short description (good for SEO & accessibility).
Repeat for as many photos as you like; the grid reflows automatically.
