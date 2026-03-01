# Folder Structure Reorganization Plan

**Date:** March 1, 2026  
**Status:** 📋 Planning

---

## Current Issues

1. ❌ **Root directory cluttered** - Too many files in root
2. ❌ **Mixed content types** - HTML, CSS, JS, docs all mixed
3. ❌ **No clear organization** - Hard to find files
4. ❌ **Documentation scattered** - MD files everywhere
5. ❌ **Temporary files** - Old resume files, temp files
6. ❌ **Inconsistent naming** - Some files use different conventions

---

## Proposed Structure (Best Practices)

```
kongaraju.github.io/
│
├── 📁 assets/                      # All static assets
│   ├── 📁 css/                     # Stylesheets
│   │   ├── main.css               # Main styles
│   │   ├── cookie-consent.css     # Cookie styles
│   │   └── fonts/                 # Font files
│   │
│   ├── 📁 js/                      # JavaScript files
│   │   ├── main.js                # Main scripts
│   │   ├── cookie-consent.js      # Cookie logic
│   │   ├── pwa-install.js         # PWA handler
│   │   ├── performance.js         # Performance optimizations
│   │   ├── particles.js           # Particle effects
│   │   └── p5.min.js              # P5.js library
│   │
│   ├── 📁 img/                     # Images and icons
│   │   ├── 📁 icons/              # Favicons and app icons
│   │   ├── 📁 projects/           # Project screenshots
│   │   └── 📁 misc/               # Other images
│   │
│   └── 📁 fonts/                   # Custom fonts (if any)
│
├── 📁 pages/                       # HTML pages (except index)
│   ├── resume.html
│   ├── privacy-policy.html
│   ├── 404.html
│   └── 📁 case-studies/           # Case study pages
│       ├── arkeydock.html
│       ├── arkeyjs.html
│       └── antkorp.html
│
├── 📁 docs/                        # Documentation
│   ├── README.md                  # Main documentation
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── CHANGELOG.md               # Version history
│   └── 📁 guides/                 # Implementation guides
│       ├── PWA_IMPLEMENTATION.md
│       ├── ICON_GENERATION.md
│       ├── PRINT_OPTIMIZATION.md
│       └── WEEK*.md
│
├── 📁 .well-known/                 # Security and standards
│   └── security.txt
│
├── 📁 .github/                     # GitHub specific
│   └── workflows/                 # CI/CD (future)
│
├── 📄 index.html                   # Homepage (must be in root)
├── 📄 manifest.json                # PWA manifest (root for compatibility)
├── 📄 service-worker.js            # Service worker (must be in root)
├── 📄 robots.txt                   # SEO (must be in root)
├── 📄 sitemap.xml                  # SEO (must be in root)
├── 📄 humans.txt                   # Credits (root convention)
├── 📄 favicon.ico                  # Favicon (must be in root)
├── 📄 CNAME                        # Custom domain (must be in root)
├── 📄 .gitignore                   # Git ignore
├── 📄 README.md                    # Project readme (root convention)
└── 📄 LICENSE                      # License file

```

---

## Files That MUST Stay in Root

These files have technical requirements to be in the root directory:

1. ✅ **index.html** - Entry point for website
2. ✅ **service-worker.js** - PWA requirement (scope issues if moved)
3. ✅ **manifest.json** - PWA manifest (best practice)
4. ✅ **robots.txt** - Search engines expect it in root
5. ✅ **sitemap.xml** - Search engines expect it in root
6. ✅ **favicon.ico** - Browsers look for it in root first
7. ✅ **CNAME** - GitHub Pages requirement
8. ✅ **humans.txt** - Convention to keep in root
9. ✅ **README.md** - GitHub convention
10. ✅ **.gitignore** - Git requirement

---

## Files to Move

### Move to `/assets/css/`:
- ❌ cookie-consent.css → ✅ /assets/css/cookie-consent.css
- ❌ css/style.css → ✅ /assets/css/main.css
- ❌ css/font.css → ✅ /assets/css/fonts.css

### Move to `/assets/js/`:
- ❌ cookie-consent.js → ✅ /assets/js/cookie-consent.js
- ❌ pwa-install.js → ✅ /assets/js/pwa-install.js
- ❌ performance.js → ✅ /assets/js/performance.js
- ❌ js/script.js → ✅ /assets/js/main.js
- ❌ js/particles.js → ✅ /assets/js/particles.js
- ❌ js/p5.min.js → ✅ /assets/js/p5.min.js

### Move to `/assets/img/`:
- ❌ img/* → ✅ /assets/img/*
  - Create subfolders: icons/, projects/, misc/

### Move to `/pages/`:
- ❌ resume.html → ✅ /pages/resume.html
- ❌ privacy-policy.html → ✅ /pages/privacy-policy.html
- ❌ 404.html → ✅ /pages/404.html (or keep in root for GitHub Pages)

### Move to `/pages/case-studies/`:
- ❌ case-study-arkeydock.html → ✅ /pages/case-studies/arkeydock.html
- ❌ case-study-arkeyjs.html → ✅ /pages/case-studies/arkeyjs.html
- ❌ case-study-antkorp.html → ✅ /pages/case-studies/antkorp.html

### Move to `/docs/`:
- ❌ All .md files (except README.md) → ✅ /docs/
- Create `/docs/guides/` for implementation guides

### Move to `/components/`:
- ❌ cookie-consent.html → ✅ /components/cookie-consent.html

### Delete/Archive:
- ❌ experiment.html (old file?)
- ❌ findme.html (old file?)
- ❌ portfolio.html (duplicate?)
- ❌ presentations.html (old file?)
- ❌ rajuk_resume.html (old file?)
- ❌ crossdomain.xml (legacy Flash, not needed)
- ❌ .project (IDE file, should be in .gitignore)
- ❌ ~$ju Konga... (temp file)
- ❌ Raju Konga – Principal Frontend Engineer Resume.txt (move to /docs/archive/)
- ❌ Raju Konga – Principal Frontend Engineer.pdf (move to /docs/archive/)

---

## Implementation Strategy

### Phase 1: Create New Structure (No Breaking Changes)
1. Create new folders: `/assets/`, `/pages/`, `/docs/`, `/components/`
2. Create subfolders: `/assets/css/`, `/assets/js/`, `/assets/img/`
3. Copy files to new locations (don't delete originals yet)
4. Update all file references in HTML/CSS/JS

### Phase 2: Update References
1. Update all HTML files to point to new asset locations
2. Update service-worker.js cache paths
3. Update manifest.json icon paths
4. Update sitemap.xml page URLs
5. Test all pages to ensure nothing breaks

### Phase 3: Cleanup
1. Delete old files from root
2. Delete old folders (css/, js/, img/)
3. Update .gitignore
4. Commit changes

### Phase 4: Documentation
1. Update README.md with new structure
2. Create CHANGELOG.md
3. Update all documentation references

---

## Benefits

### ✅ Organization
- Clear separation of concerns
- Easy to find files
- Logical grouping

### ✅ Scalability
- Easy to add new pages
- Easy to add new assets
- Room for growth

### ✅ Maintainability
- Easier to update
- Easier to debug
- Better for collaboration

### ✅ Professional
- Industry standard structure
- Follows best practices
- Easier for others to understand

### ✅ Performance
- Better caching strategies
- Easier CDN integration
- Cleaner URLs

---

## Considerations

### GitHub Pages Specific:
- **404.html** - Can be in root or /pages/, but root is simpler
- **CNAME** - Must be in root
- **index.html** - Must be in root
- Custom domains work with any structure

### Service Worker Scope:
- Service worker in root can control entire site
- Moving it would limit scope
- Keep in root for maximum coverage

### SEO:
- Clean URLs are better: `/pages/resume.html` vs `/resume.html`
- Can use URL rewriting (but not on GitHub Pages)
- Consider keeping main pages in root for simpler URLs

---

## Alternative: Minimal Reorganization

If full reorganization is too risky, do minimal cleanup:

```
kongaraju.github.io/
├── 📁 assets/                      # New: All assets
│   ├── css/
│   ├── js/
│   └── img/
├── 📁 docs/                        # New: All documentation
├── 📁 components/                  # New: Reusable components
├── 📄 index.html                   # Keep in root
├── 📄 resume.html                  # Keep in root (simpler URL)
├── 📄 privacy-policy.html          # Keep in root
├── 📄 case-study-*.html           # Keep in root (or move all)
├── 📄 404.html                     # Keep in root
├── 📄 service-worker.js            # Keep in root
├── 📄 manifest.json                # Keep in root
├── 📄 robots.txt                   # Keep in root
├── 📄 sitemap.xml                  # Keep in root
└── ... (other root files)
```

This approach:
- ✅ Cleans up root directory
- ✅ Organizes assets
- ✅ Keeps URLs simple
- ✅ Less breaking changes
- ✅ Easier to implement

---

## Recommendation

**Option 1: Full Reorganization** (Best for long-term)
- Most professional
- Best practices
- More work upfront
- Better scalability

**Option 2: Minimal Reorganization** (Best for quick wins)
- Less risky
- Faster to implement
- Still improves organization
- Easier to test

**My Recommendation:** Start with **Option 2 (Minimal)**, then gradually move to Option 1 as needed.

---

## Next Steps

1. **Decide on approach** (Full vs Minimal)
2. **Create new folders**
3. **Copy files** (don't delete yet)
4. **Update references**
5. **Test thoroughly**
6. **Delete old files**
7. **Update documentation**
8. **Commit and deploy**

---

**Status:** 📋 Awaiting approval to proceed  
**Estimated Time:** 2-3 hours for minimal, 4-6 hours for full  
**Risk Level:** Low (if done carefully with testing)

