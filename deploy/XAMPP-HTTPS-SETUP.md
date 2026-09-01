# Enabling HTTPS on XAMPP

Service workers and Cache Storage only exist in a **secure context**.
Confirmed on a Lenovo K10 (Chrome 151, Android 11):

| | `http://192.168.1.6` | `https://192.168.1.6` |
|---|---|---|
| Secure context | NO | **YES** |
| Service worker | unavailable | **available** |
| Cache Storage | unavailable | **available (~3-4 GB)** |

Everything below stays on your LAN. No internet is involved.

A ready-made certificate for **192.168.1.6** is already in
`deploy/cert/` — if that is your laptop's IP you can skip Step 1.

---

## Step 0 — Lock the laptop's IP first

If the laptop's IP changes, the certificate stops matching and every
tablet shows a warning. Reserve it on the router by MAC address (DHCP
reservation), or set a static IP on the laptop's Wi-Fi adapter.

Confirm with `ipconfig` that it is `192.168.1.6`.

## Step 1 — (Only if your IP is NOT 192.168.1.6)

Open a terminal in `C:\xampp\apache\bin` and run, replacing the IP in
**both** places:

```
openssl req -x509 -nodes -days 825 -newkey rsa:2048 ^
  -keyout tide.key -out tide.crt ^
  -subj "/CN=192.168.1.6" ^
  -addext "subjectAltName=IP:192.168.1.6"
```

`subjectAltName` is **not optional** — modern Chrome ignores Common Name
entirely and validates against SAN. Without it the tablets reject the
certificate regardless of anything else.

## Step 2 — Copy the certificate into XAMPP

From `deploy/cert/` in this project:

```
tide.crt  ->  C:\xampp\apache\conf\ssl.crt\tide.crt
tide.key  ->  C:\xampp\apache\conf\ssl.key\tide.key
```

## Step 3 — Point Apache at it

Open `C:\xampp\apache\conf\extra\httpd-ssl.conf`.

Find the `<VirtualHost _default_:443>` block and set these four lines
(they already exist — edit them, do not add duplicates):

```apache
DocumentRoot "C:/xampp/htdocs"
ServerName 192.168.1.6:443
SSLCertificateFile "conf/ssl.crt/tide.crt"
SSLCertificateKeyFile "conf/ssl.key/tide.key"
```

Then check `C:\xampp\apache\conf\httpd.conf` — these two lines must NOT
start with `#`:

```apache
LoadModule ssl_module modules/mod_ssl.so
Include conf/extra/httpd-ssl.conf
```

In XAMPP they are usually enabled already.

## Step 4 — Restart Apache

XAMPP Control Panel → **Stop** Apache → **Start** Apache.

If it refuses to start, click **Logs → Apache (error.log)**. A wrong path
in Step 3 is the usual cause.

## Step 5 — Test on the laptop

Open `https://192.168.1.6/tide-journey/check.html` in the laptop's
browser.

You will get a certificate warning — that is expected, the certificate is
self-signed. Click **Advanced → Proceed**.

The page should now show:

```
✓ CACHING WILL WORK ON THIS TABLET
Secure context          YES
Service worker API      YES
Cache Storage API       YES
Service worker reg.     SUCCEEDED
```

If it still says NO, HTTPS is not actually serving — recheck Step 3.

**Do not go further until this page is green on the laptop.**

## Step 6 — Install the certificate on ONE tablet

This removes the warning and makes Chrome trust the site fully.

1. Get `tide.crt` onto the tablet. Easiest: with the old HTTP site still
   running, browse to `http://192.168.1.6/tide-journey/tide.crt` and let
   it download. (Copy `tide.crt` into `htdocs\tide-journey\` first.)
2. Android **Settings → Security → Encryption & credentials →
   Install a certificate → CA certificate**.
3. Tap **Install anyway** on the "your network may be monitored" notice —
   that warning is generic for any private certificate.
4. Pick the downloaded `tide.crt`. Name it `Tide Journey`.

Android may require a screen lock (PIN/pattern) before it allows CA
installation. Set one if prompted.

## Step 7 — Test that tablet

Open `https://192.168.1.6/tide-journey/check.html` on the tablet.

Expected: **no warning at all**, and all four rows green.

Also check the bottom two rows — the video decode probe should still read
~99% real time with few dropped frames.

**Send me this screen and I will build the caching layer.**

## Step 8 — Roll out to the rest (only after Step 7 passes)

Repeat Step 6 on each tablet. Budget about a minute each; do it in
batches.

Optionally force HTTP → HTTPS so a mistyped address cannot silently drop
a tablet back to the uncacheable version. In
`C:\xampp\apache\conf\extra\httpd-vhosts.conf`:

```apache
<VirtualHost *:80>
    ServerName 192.168.1.6
    Redirect permanent / https://192.168.1.6/
</VirtualHost>
```

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Apache will not start on 443 | Port in use — Skype, IIS, VMware. XAMPP → **Netstat** shows what holds it. |
| `ERR_CERT_COMMON_NAME_INVALID` | `subjectAltName` missing. Use the supplied certificate or redo Step 1. |
| Warning persists after install | Installed under "User certificate" instead of **CA certificate**. |
| Secure context still NO | Still on `http://`. Check for the padlock in the address bar. |
| Works on laptop, not tablets | Windows Firewall blocking port 443 on the private network. |
| Was working, now warns | Laptop's IP changed. That is Step 0. |

## Security note

`tide.key` is the private key. It is committed here only because this is
an isolated offline kiosk LAN with no sensitive data. Do not reuse this
certificate for anything internet-facing.
