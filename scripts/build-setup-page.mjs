// Emits dist/setup.html — the page a technician opens on each tablet to
// install the CA certificate by scanning a QR code.
//
// The QR encodes an absolute URL, which means it must be baked per-origin.
// We pre-render the common case (the IP the certificate is issued for) and
// the page swaps in a runtime-generated notice if the tablet is being served
// from a different address, so a changed laptop IP degrades to clear
// instructions rather than a QR pointing at the wrong host.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { qrSvg } from './qr.mjs'

const dist = join(process.cwd(), 'dist')
const certPath = join(dist, 'tide.crt')

function certIp() {
  if (!existsSync(certPath)) return null
  try {
    const text = execFileSync('openssl', ['x509', '-in', certPath, '-noout', '-ext', 'subjectAltName'], {
      encoding: 'utf8',
    })
    const m = /IP Address:([0-9.]+)/.exec(text)
    return m ? m[1] : null
  } catch {
    return null // openssl not on PATH — fall back to the documented default
  }
}

const ip = certIp() ?? '192.168.1.6'
const base = `https://${ip}/tide-journey`
const certUrl = `${base}/tide.crt`
const appUrl = `${base}/`

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tide Journey — Tablet Setup</title>
<style>
  :root{color-scheme:light}
  *{box-sizing:border-box}
  body{margin:0;font:16px/1.55 Roboto,system-ui,sans-serif;background:#f4f7fc;color:#14243d;padding:24px}
  .wrap{max-width:760px;margin:0 auto}
  h1{font-size:26px;margin:0 0 4px;color:#184890}
  p.sub{margin:0 0 22px;color:#5b6f8c;font-size:15px}
  .card{background:#fff;border:1px solid #d4e0f0;border-radius:14px;padding:20px;margin-bottom:16px}
  .step{display:flex;gap:14px;align-items:flex-start;margin-bottom:18px}
  .step:last-child{margin-bottom:0}
  .num{flex:0 0 30px;height:30px;border-radius:50%;background:#184890;color:#fff;
       display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px}
  .step h3{margin:2px 0 4px;font-size:16px}
  .step p{margin:0;color:#41566f;font-size:15px}
  .qrbox{text-align:center;padding:8px 0 4px}
  .qrbox svg{width:250px;height:250px;border:1px solid #d4e0f0;border-radius:10px}
  .url{font-family:ui-monospace,Consolas,monospace;font-size:14px;background:#eef4fc;
       padding:8px 12px;border-radius:8px;display:inline-block;margin-top:10px;word-break:break-all}
  a.btn{display:block;text-align:center;background:#184890;color:#fff;text-decoration:none;
        padding:16px;border-radius:12px;font-weight:700;font-size:17px;margin-top:6px}
  a.btn.alt{background:#fff;color:#184890;border:2px solid #184890;margin-top:10px}
  .note{background:#fff8e1;border:1px solid #e0c060;border-radius:10px;padding:12px 14px;
        font-size:14px;color:#6b5200;margin-top:14px}
  .warn{background:#fdeceb;border:1px solid #c62d05;color:#8c2103}
  h2{font-size:17px;margin:0 0 12px;color:#184890}
  .hide{display:none}
</style>
</head>
<body>
<div class="wrap">
  <h1>Tide Journey — Tablet Setup</h1>
  <p class="sub">Do this once per tablet. Takes about a minute.</p>

  <div id="mismatch" class="note warn hide"></div>

  <div class="card">
    <h2>Step 1 — Install the certificate</h2>
    <div class="qrbox">
      ${qrSvg(certUrl, { scale: 6 })}
      <div class="url">${certUrl}</div>
    </div>
    <a class="btn" href="./tide.crt" download="tide.crt">Or tap here to download</a>
    <div class="note">
      Scan with the tablet's camera, or just tap the button above if you are
      already reading this on the tablet.
    </div>
  </div>

  <div class="card">
    <h2>Step 2 — Tell Android to trust it</h2>
    <div class="step"><div class="num">1</div><div>
      <h3>Open Settings → Security</h3>
      <p>Then <b>Encryption &amp; credentials → Install a certificate → CA certificate</b>.</p>
    </div></div>
    <div class="step"><div class="num">2</div><div>
      <h3>Tap “Install anyway”</h3>
      <p>Android shows a generic “your network may be monitored” warning for
         any private certificate. That is expected here.</p>
    </div></div>
    <div class="step"><div class="num">3</div><div>
      <h3>Pick <b>tide.crt</b> from Downloads</h3>
      <p>Name it <b>Tide Journey</b> when asked.</p>
    </div></div>
    <div class="note">
      Android may ask you to set a screen lock (PIN or pattern) first. Set one —
      it is required before any certificate can be installed.
    </div>
  </div>

  <div class="card">
    <h2>Step 3 — Confirm it worked</h2>
    <a class="btn" href="./check.html">Run the device check</a>
    <a class="btn alt" href="./">Open Tide Journey</a>
    <div class="note">
      The check page should show <b>no certificate warning</b> and four green
      rows. If you still see a warning, the certificate was installed as a
      “user” certificate instead of a <b>CA</b> certificate — repeat Step 2.
    </div>
  </div>

  <div class="card">
    <h2>Step 4 — Let the media download</h2>
    <p style="margin:0;color:#41566f">
      Open the app and leave it on screen until the “Preparing offline media”
      pill reaches 100% and says <b>Ready to use offline</b>. That is roughly
      67 MB per tablet. Then the tablet is done — video plays from its own
      storage from then on.
    </p>
  </div>
</div>

<script>
// If this page is being served from an address the certificate was not issued
// for, the QR above points at the wrong host. Say so plainly instead of
// letting a technician scan something that cannot work.
(function () {
  var expected = ${JSON.stringify(`https://${ip}`)};
  var actual = location.protocol + '//' + location.host;
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
  if (actual !== expected) {
    var el = document.getElementById('mismatch');
    el.className = 'note warn';
    el.innerHTML =
      '<b>Address mismatch.</b> This page is being served from <b>' + actual +
      '</b> but the certificate was issued for <b>' + expected + '</b>. ' +
      'The QR code below will not work. Either serve the app from ' + expected +
      ', or generate a new certificate for this address (see XAMPP-HTTPS-SETUP.md, Step 1).';
  }
})();
</script>
</body>
</html>
`

writeFileSync(join(dist, 'setup.html'), html)
console.log(`setup.html: QR -> ${certUrl}`)
