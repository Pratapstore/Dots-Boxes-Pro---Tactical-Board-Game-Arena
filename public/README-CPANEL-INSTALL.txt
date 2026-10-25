================================================================================
DOTS & BOXES PRO - CPANEL DEPLOYMENT INSTRUCTIONS (NO BLANK SCREEN)
================================================================================

[HINDI]
WEBSITE BLANK KYUN DIKH RAHA THA?
- cPanel Apache web server par direct raw source code (TypeScript / .tsx) run nahi hota.
- Agar aapne purana source zip upload kiya tha, to browser me blank page aata hai kyunki 
  browser TypeScript (.tsx) ko seedhe samajh nahi pata.
- cPanel / Shared Hosting ke liye PRE-COMPILED production files (index.html + assets + .htaccess) 
  chahiye hoti hain jo is ZIP me taiyar hain!

CPANEL MEIN UPLOAD KARNE KA STEP-BY-STEP TAREEKA:
--------------------------------------------------------------------------------
1. Apne hosting account me cPanel login karein.
2. "File Manager" par click karein.
3. "public_html" folder ko open karein.
4. Agar public_html me koi purani kharab files hain to unhe delete ya backup kar lein.
5. "Upload" button par click karein aur is 'cpanel-ready-build.zip' ko upload karein.
6. Upload complete hone ke baad file par Right Click karein aur "Extract" choose karein.
7. DHYAN DEIN: Files seedhe 'public_html/' ke root me honi chahiye:
   - public_html/index.html
   - public_html/assets/ (saari JS aur CSS files)
   - public_html/.htaccess
   - public_html/icon.svg
   - public_html/manifest.webmanifest
8. Ab apna domain (e.g. https://yourdomain.com/) browser me open karein!
   Aapki game bina kisi blank screen ke super-fast chalegi!

--------------------------------------------------------------------------------
[ENGLISH]
WHY DID YOU SEE A BLANK SCREEN BEFORE?
Browsers and standard cPanel Apache web servers cannot execute raw TypeScript (.tsx) 
files. A production build must compile TypeScript into optimized JavaScript bundles 
with relative paths and proper Apache URL rewrite rules (.htaccess).

HOW TO DEPLOY ON CPANEL:
1. Log in to your hosting cPanel.
2. Open File Manager and navigate into `public_html`.
3. Upload `cpanel-ready-build.zip`.
4. Right-click the zip and select 'Extract'.
5. Make sure `index.html`, `assets/`, and `.htaccess` are directly inside `public_html`.
6. Visit your domain in your browser. Done!
================================================================================
