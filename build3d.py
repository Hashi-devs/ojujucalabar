#!/usr/bin/env python3
"""Builds the 3D game: artifact fragment, standalone page, installable web app and APK-ready project files."""
import json, os, shutil, subprocess
ROOT = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(ROOT, 'src', p), encoding='utf-8').read()
css, body = rd('style.css'), rd('body.html')
# optional loading-screen illustration: drop any png/jpg/webp named loading.* into assets/
import base64, glob, io
load_uri = None
for cand in sorted(glob.glob(os.path.join(ROOT, 'assets', 'loading.*'))):
    try:
        from PIL import Image
        im = Image.open(cand).convert('RGB')
        im.thumbnail((1280, 1280))
        buf = io.BytesIO(); im.save(buf, 'JPEG', quality=82, optimize=True, progressive=True)
        load_uri = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
        print('loading illustration embedded:', os.path.basename(cand), len(load_uri) // 1024, 'KB')
    except Exception as e:
        print('could not read', cand, e)
    break
# the title screen picture: assets/title.png|jpg|jpeg|webp replaces the drawn house on the hill
title_uri = None
for cand in sorted(glob.glob(os.path.join(ROOT, 'assets', 'title.*'))):
    try:
        from PIL import Image
        im = Image.open(cand).convert('RGB')
        im.thumbnail((1400, 1400))
        buf = io.BytesIO(); im.save(buf, 'JPEG', quality=82, optimize=True, progressive=True)
        title_uri = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
        print('title picture embedded:', os.path.basename(cand), len(title_uri) // 1024, 'KB')
    except Exception as e:
        print('could not read', cand, e)
    break
# the Ojuju display face, bundled so it works offline inside the APK
font_css = ''
for w, n in [(400, 'Regular'), (700, 'Bold'), (800, 'ExtraBold')]:
    fp = os.path.join(ROOT, 'assets', 'fonts', f'Ojuju-{n}.sub.woff')
    if os.path.exists(fp):
        font_css += '@font-face { font-family: "Ojuju"; font-style: normal; font-weight: %d; font-display: swap; src: url(data:font/woff;base64,%s) format("woff"); }\n' % (w, base64.b64encode(open(fp, 'rb').read()).decode())
# Boldonse, only for the studio name on the opening screen (cut down to those letters; SIL Open Font License)
fp = os.path.join(ROOT, 'assets', 'fonts', 'Boldonse.sub.woff')
if os.path.exists(fp):
    font_css += '@font-face { font-family: "Boldonse"; font-style: normal; font-weight: 400; font-display: block; src: url(data:font/woff;base64,%s) format("woff"); }\n' % base64.b64encode(open(fp, 'rb').read()).decode()
# Garet, for STUDIOS under the logo: drop any Garet file (Book/Regular) into assets/fonts and it's cut down to those letters and embedded
import glob
gsrc = sorted(glob.glob(os.path.join(ROOT, 'assets', 'fonts', 'Garet*.*')), key=lambda f: ('Book' not in f and 'Regular' not in f, f))
gsrc = [f for f in gsrc if f.lower().endswith(('.ttf', '.otf', '.woff', '.woff2')) and '.sub.' not in f and '.web.' not in f]
if gsrc:
    from fontTools.ttLib import TTFont as _TT   # packaged whole as a web font (Spacetype's licence allows web packages, not edits to the font)
    gout = os.path.join(ROOT, 'assets', 'fonts', 'Garet.web.woff')
    _f = _TT(gsrc[0]); _f.flavor = 'woff'; _f.save(gout)
    font_css += '@font-face { font-family: "Garet"; font-style: normal; font-weight: 400; font-display: block; src: url(data:font/woff;base64,%s) format("woff"); }\n' % base64.b64encode(open(gout, 'rb').read()).decode()
else:
    font_css += '@font-face { font-family: "Garet"; font-style: normal; font-weight: 400; src: local("Garet Book"), local("Garet-Book"), local("Garet"); }\n'
# Ogaranya (by Nebo Ikechukwu Kingsley), the body font: kept inside the page, never as a separate downloadable file, as its licence asks
_og = os.path.join(ROOT, 'assets', 'fonts', 'Ogaranya-Regular.woff2')
if os.path.exists(_og):
    font_css += '@font-face { font-family: "Ogaranya"; font-style: normal; font-weight: 400; font-display: swap; src: url(data:font/woff2;base64,%s) format("woff2"); }\n' % base64.b64encode(open(_og, 'rb').read()).decode()
css_inline = font_css + css
# web builds: the Ojuju letters come as files (the opening only needs Boldonse, which stays inside the page)
web_font_css = font_css
for w, n in [(400, 'Regular'), (700, 'Bold'), (800, 'ExtraBold')]:
    fp = os.path.join(ROOT, 'assets', 'fonts', f'Ojuju-{n}.sub.woff')
    if os.path.exists(fp):
        web_font_css = web_font_css.replace('url(data:font/woff;base64,%s)' % base64.b64encode(open(fp, 'rb').read()).decode(), f'url(a/fonts/Ojuju-{n}.woff)')
def copy_fonts(outdir):
    os.makedirs(os.path.join(outdir, 'a', 'fonts'), exist_ok=True)
    for n in ['Regular', 'Bold', 'ExtraBold']:
        fp = os.path.join(ROOT, 'assets', 'fonts', f'Ojuju-{n}.sub.woff')
        if os.path.exists(fp): shutil.copy(fp, os.path.join(outdir, 'a', 'fonts', f'Ojuju-{n}.woff'))
css_body = css
font_css_web = web_font_css
css = css_inline
# optional voice lines: assets/voice/<line id>.<any audio>  ->  cleaned, levelled, small mono MP3s
voices = {}
vdir = os.path.join(ROOT, 'assets', 'voice')
if os.path.isdir(vdir):
    import tempfile
    for fn in sorted(os.listdir(vdir)):
        vid, ext = os.path.splitext(fn)
        if ext.lower() not in ('.m4a', '.mp3', '.ogg', '.opus', '.wav', '.aac', '.amr', '.3gp', '.webm', '.flac'):
            continue
        out = os.path.join(tempfile.gettempdir(), 'voice_' + vid + '.mp3')
        cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(vdir, fn), '-ac', '1', '-ar', '24000',
               '-af', 'highpass=f=70,afftdn=nf=-28,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1,areverse,loudnorm=I=-16:TP=-1.5',
               '-c:a', 'libmp3lame', '-b:a', '48k', out]
        try:
            subprocess.run(cmd, check=True)
            voices[vid] = 'data:audio/mpeg;base64,' + base64.b64encode(open(out, 'rb').read()).decode()
            print('voice line embedded:', fn, len(voices[vid]) // 1024, 'KB')
        except Exception as e:
            print('could not convert', fn, e)
VERSION = '4.7.7'
# drawings dropped into a folder by name replace the placeholder of that name:
#   assets/comic/<panel art id>.png|jpg|jpeg|webp  -> comic panels
#   assets/gallery/<g1..g7>.png|jpg|jpeg|webp      -> gallery pictures
def embed_dir(folder, size, label):
    out = {}
    d = os.path.join(ROOT, 'assets', folder)
    if not os.path.isdir(d):
        return out
    try:
        from PIL import Image
        import io
        for fn in sorted(os.listdir(d)):
            aid, ext = os.path.splitext(fn)
            if ext.lower() not in ('.png', '.jpg', '.jpeg', '.webp'):
                continue
            im = Image.open(os.path.join(d, fn)).convert('RGB')
            im.thumbnail(size)
            buf = io.BytesIO(); im.save(buf, 'JPEG', quality=82)
            out[aid] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
            print(label, 'embedded:', fn, len(out[aid]) // 1024, 'KB')
    except Exception as e:
        print(label, 'images skipped:', e)
    return out
gallery_img = embed_dir('gallery', (1000, 1300), 'gallery picture')
comic_img = {}
cdir = os.path.join(ROOT, 'assets', 'comic')
if os.path.isdir(cdir):
    try:
        from PIL import Image
        import io
        for fn in sorted(os.listdir(cdir)):
            aid, ext = os.path.splitext(fn)
            if ext.lower() not in ('.png', '.jpg', '.jpeg', '.webp'):
                continue
            im = Image.open(os.path.join(cdir, fn)).convert('RGB')
            im.thumbnail((1200, 900))
            buf = io.BytesIO(); im.save(buf, 'JPEG', quality=82)
            comic_img[aid] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
            print('comic panel embedded:', fn, len(comic_img[aid]) // 1024, 'KB')
    except Exception as e:
        print('comic images skipped:', e)
# sound effects: assets/sfx/<name>.mp3 (or <name>_1.mp3, <name>_2.mp3 ... for variations) replaces the synth sound of that name
sfx = {}
sdir = os.path.join(ROOT, 'assets', 'sfx')
if os.path.isdir(sdir):
    import re as _re
    mimes = {'.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.ogg': 'audio/ogg'}
    for fn in sorted(os.listdir(sdir)):
        stem, ext = os.path.splitext(fn)
        if ext.lower() not in mimes:
            continue
        name = _re.sub(r'[_-]\d+$', '', stem).lower()
        sfx.setdefault(name, []).append('data:' + mimes[ext.lower()] + ';base64,' + base64.b64encode(open(os.path.join(sdir, fn), 'rb').read()).decode())
    if sfx: print('sound effects embedded:', ', '.join(f'{k}x{len(v)}' for k, v in sfx.items()))
def make_js(sfx, voices, comic_img, gallery_img):
    return 'const LOAD_IMG = ' + json.dumps(load_uri) + ';\nconst TITLE_IMG = ' + json.dumps(title_uri) + ';\nconst SFX = ' + json.dumps(sfx) + ';\nconst VOICES = ' + json.dumps(voices) + ';\nconst COMIC_IMG = ' + json.dumps(comic_img) + ';\nconst GALLERY_IMG = ' + json.dumps(gallery_img) + ';\nconst VERSION_TAG = ' + json.dumps(VERSION) + ';\n' + '\n'.join(rd(f) for f in ['core.js', 'audio.js', 'textures.js', 'textures2.js', 'textures_ng.js', 'paintings.js', 'engine.js', 'art2.js', 'rooms3d.js', 'rooms_new.js', 'story.js', 'pidgin.js', 'scares.js', 'chase.js', 'puzzles.js', 'presence.js', 'ads.js', 'comic.js', 'game.js', 'leaderboard.js', 'nepa.js', 'extras.js', 'desktop.js'])
def make_fragment(js, css=css_inline):
    return f'''<title>Ojuju Calabar</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap">
<style>
{css}
</style>
{body}
<script>
(() => {{
'use strict';
{js}
}})();
</script>
'''

# web builds keep sounds and pictures as separate small files that load after the game opens, so the page itself starts fast
EXT = {'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/wav': 'wav', 'audio/ogg': 'ogg', 'image/jpeg': 'jpg'}
def externalize(d, folder, outdir):
    os.makedirs(os.path.join(outdir, 'a', folder), exist_ok=True)
    def one(key, uri):
        mime = uri[5:uri.index(';')]
        name = f'a/{folder}/{key}.{EXT.get(mime, "bin")}'
        open(os.path.join(outdir, name), 'wb').write(base64.b64decode(uri[uri.index(',') + 1:]))
        return name
    return {k: ([one(f'{k}_{n}', u) for n, u in enumerate(v)] if isinstance(v, list) else one(k, v)) for k, v in d.items()}
def external_js(outdir):
    shutil.rmtree(os.path.join(outdir, 'a'), ignore_errors=True)
    return make_js(externalize(sfx, 'sfx', outdir), externalize(voices, 'voice', outdir), externalize(comic_img, 'comic', outdir), externalize(gallery_img, 'gallery', outdir))
js = make_js(sfx, voices, comic_img, gallery_img)
fragment = make_fragment(js)
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
open(os.path.join(ROOT, 'dist', 'artifact3d.html'), 'w', encoding='utf-8').write(fragment)
open(os.path.join(ROOT, 'dist', 'bundle.js'), 'w', encoding='utf-8').write("(() => {\n'use strict';\n" + js + "\n})();\n")
print('built', len(fragment), 'bytes')

standalone = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#0c0a11">
<meta name="description" content="A first-person Nigerian folk-horror escape game. Seven rooms. One name to remember. Free on phone and PC.">
<meta property="og:title" content="Ojuju Calabar">
<meta property="og:description" content="A first-person Nigerian folk-horror escape game. Seven rooms. One name to remember.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://ojujucalabar.vercel.app/">
<meta property="og:image" content="https://ojujucalabar.vercel.app/og.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://ojujucalabar.vercel.app/og.jpg">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>
@@FRAGMENT@@<script>if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(function () {});</script>
</head>
</html>
'''
www = os.path.join(ROOT, 'www'); os.makedirs(www, exist_ok=True)
if os.path.exists(os.path.join(ROOT, 'assets', 'og.jpg')): shutil.copy(os.path.join(ROOT, 'assets', 'og.jpg'), os.path.join(www, 'og.jpg'))   # the link-preview picture
shell = standalone
standalone = shell.replace('@@FRAGMENT@@', make_fragment(external_js(www), font_css_web + css_body)); copy_fonts(www)
open(os.path.join(www, 'index.html'), 'w', encoding='utf-8').write(standalone)
open(os.path.join(ROOT, 'dist', 'play.html'), 'w', encoding='utf-8').write(shell.replace('@@FRAGMENT@@', fragment))   # one self-contained file, for sharing offline
shutil.copy(os.path.join(ROOT, 'assets', 'site', 'privacy.html'), os.path.join(www, 'privacy.html'))
for f in ['icon-192.png', 'icon-512.png']:
    shutil.copy(os.path.join(ROOT, 'assets', f), os.path.join(www, f))
man = {"name": "Ojuju Calabar", "short_name": "Ojuju Calabar", "description": "A first-person 3D Nigerian horror escape game in seven rooms, by Muniac Studios.",
       "start_url": "./index.html", "scope": "./", "display": "fullscreen", "orientation": "any",
       "background_color": "#0c0a11", "theme_color": "#0c0a11",
       "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
                 {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
                 {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}
open(os.path.join(www, 'manifest.webmanifest'), 'w').write(json.dumps(man, indent=2))
open(os.path.join(www, 'sw.js'), 'w').write("""const CACHE = 'ojuju-calabar-v19';
const ASSETS = ['./', 'index.html', 'privacy.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === location.origin;
  const keep = res => { if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; };
  if (same) { // game files: newest first, cached copy when offline
    e.respondWith(fetch(e.request).then(keep).catch(() => caches.match(e.request).then(hit => hit || caches.match('index.html'))));
  } else if (/fonts\\.(googleapis|gstatic)\\.com/.test(e.request.url)) { // fonts: cached copy first
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(keep)));
  }
});
""")
json.dump({"appId": "com.muniacstudios.ojujucalabar", "appName": "Ojuju Calabar", "webDir": "www"}, open(os.path.join(ROOT, 'capacitor.config.json'), 'w'), indent=2)
json.dump({"name": "ojuju-calabar", "version": VERSION, "private": True, "description": "First-person 3D Nigerian horror escape game",
           "scripts": {"setup": "npm i @capacitor/core @capacitor/cli @capacitor/android && npx cap add android",
                       "sync": "npx cap sync android", "apk": "npx cap sync android && cd android && ./gradlew assembleDebug"}},
          open(os.path.join(ROOT, 'package.json'), 'w'), indent=2)
cgd = os.path.join(ROOT, 'crazygames'); os.makedirs(cgd, exist_ok=True)
cg = shell.replace('@@FRAGMENT@@', make_fragment(external_js(cgd), font_css_web + css_body)); copy_fonts(cgd); cg = cg.replace('<link rel="manifest" href="manifest.webmanifest">', '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>')
cg = cg.replace('''<script>if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(function () {});</script>''', '')
open(os.path.join(cgd, 'index.html'), 'w', encoding='utf-8').write(cg)
shutil.copy(os.path.join(ROOT, 'assets', 'site', 'privacy.html'), os.path.join(cgd, 'privacy.html'))
shutil.copy(os.path.join(ROOT, 'assets', 'icon-192.png'), os.path.join(cgd, 'icon-192.png'))
print('standalone written; crazygames build written')
