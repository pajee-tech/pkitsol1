# PK IT Sol landing page

A static, single-page marketing site: plain HTML, CSS and vanilla JavaScript.
No build step, no dependencies, no framework.

## Structure

```
.
├── index.html            Home page (all sections, inline SVG icon sprite)
├── seo-services.html     Finished service page (example)
├── service-template.html Blank service page to copy for new services
├── css/
│   └── style.css         Design tokens, logo recolouring, sections, breakpoints
├── js/
│   ├── config.js         Brand settings and portfolio projects
│   └── main.js           Nav, tabs, carousels, accordion, forms, lightbox
├── assets/
│   └── img/              Logo files, favicon, photos and placeholder artwork
│       └── portfolio/    Search Console screenshots for the SEO portfolio
└── tools/
    ├── download-images.bat   Windows: downloads the section photos and GSC graphs
    ├── download-images.sh    macOS / Linux version of the same
    └── split_logo.py         Regenerates the logo masks from a new logo PNG
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080      # then visit http://localhost:8080
```

## Deploy

Upload the folder to any static host. For GitHub Pages: push to a repository,
then Settings → Pages → Deploy from branch → `main` / root.

## Change the brand details

Edit `js/config.js`. Name, tagline, phone, WhatsApp, email, address, map and
social links are read from there and written into every element marked with
`data-brand` or `data-brand-link`. Social icons stay hidden until you add a URL.

`index.html` also contains the same details as plain text so the page reads
correctly for search engines and without JavaScript. For a full rebrand, run a
find-and-replace on `index.html` as well (and update `<title>` and the meta tags).

## Change the colours

All colours are CSS variables at the top of `css/style.css`. Replace the
`--brand-50` … `--brand-950` scale and the whole page follows.

### How the logo follows the palette

The logo is not shown as a coloured image. It is split into two alpha masks,
`logo-ink.png` (dark artwork) and `logo-accent.png` (highlight artwork), and
CSS fills each mask with a variable:

```css
--logo-ink: var(--brand-900);
--logo-accent: var(--brand-500);
```

Add the class `logo--on-dark` to use the white version on dark backgrounds.
Browsers without CSS mask support fall back to `logo.png` with a hue filter.

To swap in a different logo:

```bash
pip install pillow numpy
python3 tools/split_logo.py path/to/new-logo.png
```

Then copy the printed `aspect-ratio` into the `.logo` rule in `css/style.css`.

## Images

Run the download script once. It saves the About and What We Offer photos, the
three Why Choose Us photos and the three Search Console graphs into `assets/img`.

- Windows: double-click `tools/download-images.bat`
- macOS / Linux: `bash tools/download-images.sh`

Until the files exist locally, each image loads from its web address
(`data-remote`), and if that also fails it shows the blue placeholder
(`data-placeholder`). Commit the downloaded files so the live site does not
depend on another server.

| Image | Local file | To change it |
| --- | --- | --- |
| About Our Company | `assets/img/about.avif` | Replace the file, or edit `src` in `index.html` |
| What We Offer | `assets/img/offer.jpg` | Same |
| Why Choose Us (3 tabs) | `assets/img/why-1.jpg`, `why-2.jpg`, `why-3.jpg` | Same. Square photos, 800 x 800 or larger |
| SEO graphs | `assets/img/portfolio/*.png` | Listed in `js/config.js` |

The Why Choose Us photos come from Unsplash (free licence, no attribution required).

## Portfolio

Everything in the portfolio is listed in `js/config.js` under `portfolio`.

### Add an SEO project (graph + "Real Result" table)

1. Take the Search Console screenshot and save it in `assets/img/portfolio/`,
   for example `gsc-my-client.png`.
2. In `js/config.js`, copy one block inside `portfolio.seo`, paste it after the
   last block (keep the comma between blocks) and edit it:

```js
{
  title: "My Client",
  link: "https://myclient.com/",
  image: "assets/img/portfolio/gsc-my-client.png",
  rows: [
    { keyword: "best keyword", rank: 1, proof: "https://i.imgur.com/xxxx.png", url: "https://myclient.com/page/" },
    { keyword: "second keyword", rank: 3, proof: "https://i.imgur.com/yyyy.png", url: "https://myclient.com/other/" }
  ]
}
```

`proof` is what opens when a visitor clicks the rank number (a SERP screenshot
uploaded to Imgur, or any link). Leave `rows` out to show only the graph.

### Add a website mockup (Web Solutions tab)

Add one line to `portfolio.web`. The laptop and phone mockups are generated
from the address:

```js
web: [
  { url: "https://zarwa.store/", title: "Zarwa Store" },
  { url: "https://newclient.com/", title: "New Client" }
]
```

Screenshots come from the service set in `screenshot` (default: WordPress.com
mShots, free, no account). The first time a new address is shown the service
needs a few seconds; the page retries by itself. To use your own screenshot
instead, add `image: "assets/img/portfolio/newclient.png"` (and optionally
`mobileImage`). Use `phone: false` to hide the phone.

### Digital Marketing tab

The five coloured cards are plain HTML in `index.html` (`.fan`). Change the
text there; each card's colour and tilt are set by `--card` and `--tilt`.

## Add a service page

`seo-services.html` is a finished example. `service-template.html` is the same
page with the text replaced by `[CAPITALS IN BRACKETS]`.

1. Copy `service-template.html` and rename the copy in lowercase with hyphens,
   for example `web-solutions.html`. Keep it in the same folder as `index.html`.
2. Open the copy and replace every `[...]` placeholder. Search for `[` to find
   them all. The parts, top to bottom:
   - `<title>` and `<meta name="description">`: unique for every page
   - Page hero: breadcrumb name, one `<h1>` with the main keyword, intro
   - What is included: six cards. Change the icon with `<use href="#i-NAME"/>`
     (the list of names is in the comment above the icon sprite). Delete or
     duplicate an `<article class="service-card">` block to change the count
   - How we work: four steps (`<li class="step">`); numbers are added automatically
   - Results: optional. Copy the block from `seo-services.html` for SEO graphs,
     or use `<div class="mockups" data-portfolio="web"></div>` for website mockups
   - Questions: each `faq__item` needs its own `sfaq-1`, `sfaq-2` ... id
   - Contact form: `data-subject="..."` pre-fills the subject line
3. In `<head>`, change `noindex, nofollow` to `index, follow`.
4. Link the page from the home page so visitors and Google can reach it:
   - footer list in `index.html`: `<li><a href="web-solutions.html">Web Solutions</a></li>`
   - optionally the main nav: change `href="#web"` to `href="web-solutions.html"`
     (do the same in the other pages' headers)
5. Open the page in a browser, check it on a phone width, then upload it.

Header, footer, floating buttons and contact details are already in the
template and read the brand settings from `js/config.js`. If you change the
header or footer in `index.html` later, repeat the change in each service page.

## Before going live

| Item | Where | What to do |
| --- | --- | --- |
| Images | `tools/download-images` | Run it once and commit the files (see Images). |
| Other artwork | `assets/img/*.svg` | Hero, industries and service-card backgrounds are still illustrations. Replace when you have photos (hero background is set in `css/style.css`, `.hero`). |
| Testimonials | `index.html`, section `.testimonials` | Replace the placeholder quotes with real ones. Put an `<img>` inside `.testimonial__avatar` to show a photo. |
| Social links | `js/config.js` | Add your Facebook, Instagram and LinkedIn URLs. |
| Contact form | `js/config.js` → `formEndpoint` | Empty: the form opens the visitor's email app. Set a Formspree (or similar) URL to send messages from the page. |
| Template | `service-template.html` | It is set to `noindex`; you can leave it out of the upload. |
| Share image | `index.html` `<head>` | `og:image` needs an absolute URL once you know the domain. |

## Interactive parts

| Component | Markup hook | Notes |
| --- | --- | --- |
| Sticky header, mobile menu | `data-header`, `data-nav-toggle` | Closes on link tap, Escape and resize |
| Tabs (industries, portfolio, why us) | `data-tabs` + `role="tab"` | Arrow-key navigation |
| Carousels (SEO projects, testimonials) | `data-carousel` | Swipe, arrows, dots, optional `data-autoplay="5000"`; slides per view set by `--per-view` in CSS |
| Service cards with proposal form | `data-feature-card`, `data-proposal` | Hover on desktop, tap on touch; submitting pre-fills the contact form |
| SEO result panel | `data-result-dialog` | Opens from "Real Result"; rank numbers link to proof |
| Website mockups | `data-portfolio="web"` | Built from URLs in `config.js` |
| FAQ accordion | `data-accordion` | One item open at a time |
| Scroll reveal | `data-reveal="left"` or `"up"` | Skipped when the visitor prefers reduced motion |

## Browser support

Current Chrome, Edge, Firefox and Safari (desktop and mobile).
