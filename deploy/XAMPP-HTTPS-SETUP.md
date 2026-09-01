# Enabling HTTPS on XAMPP (for media caching)

Service workers and Cache Storage only exist in a **secure context**.
`http://192.168.1.6/tide-journey` is not one — confirmed on a Lenovo K10
(Chrome 151): secure context NO, service worker NO, Cache Storage NO.

Serving the same files over HTTPS from the same IP flips all three to
available with a ~4 GB quota. Everything below stays on your LAN; no
internet is involved at any point.

Replace `192.168.1.6` throughout if your laptop's IP differs.

---

## 1. Give the laptop a fixed IP

Do this first. If the laptop's IP changes, the certificate stops matching
and every tablet shows a warning.

Either reserve it on the router (DHCP reservation, by MAC address — the
better option) or set a static IP on the laptop's Wi-Fi adapter.

## 2. Create the certificate

XAMPP ships OpenSSL. From `C:\xampp\apache\bin`, run:

```
openssl req -x509 -nodes -days 825 -newkey rsa:2048 ^
  -keyout C:\xampp\apache\conf\ssl.key\tide.key ^
  -out C:\xampp\apache\conf\ssl.crt\tide.crt ^
  -subj "/CN=192.168.1.6" ^
  -addext "subjectAltName=IP:192.168.1.6"
```

The `subjectAltName` line is **not optional**. Modern Chrome ignores the
Common Name entirely and validates against SAN — without it the tablets
reject the certificate no matter what else you do.

825 days is the maximum lifetime Chrome accepts.

## 3. Point Apache at it

Open `C:\xampp\apache\conf\extra\httpd-ssl.conf` and set, inside the
`<VirtualHost _default_:443>` block:

```apache
ServerName 192.168.1.6:443
DocumentRoot "C:/xampp/htdocs"
SSLCertificateFile "conf/ssl.crt/tide.crt"
SSLCertificateKeyFile "conf/ssl.key/tide.key"
```

Confirm SSL is enabled in `C:\xampp\apache\conf\httpd.conf` — these two
lines must not be commented out:

```apache
LoadModule ssl_module modules/mod_ssl.so
Include conf/extra/httpd-ssl.conf
```

Restart Apache from the XAMPP control panel. If it fails to start, click
**Logs → Apache (error.log)** — a bad path in the config is the usual
cause.

## 4. Verify on the laptop

Open `https://192.168.1.6/tide-journey/check.html` in the laptop's
browser. Expect a certificate warning (it is self-signed) — proceed past
it. The page should now report:

```
Secure context          YES
Service worker API      YES
Cache Storage API       YES
Service worker reg.     SUCCEEDED
```

If it still says NO, HTTPS is not actually serving — recheck step 3.

## 5. Install the certificate on each tablet

Without this, Chrome shows a full-page warning on every launch. With it,
the tablets treat the site as fully trusted.

1. Copy `tide.crt` onto the tablet (USB, or download it once over HTTP).
2. Android **Settings → Security → Encryption & credentials →
   Install a certificate → CA certificate**.
3. Accept the "your network may be monitored" notice — that warning is
   generic and expected for any private CA.
4. Name it `Tide Journey`.

Android may require a screen lock (PIN/pattern) before it will install a
CA certificate. Set one if prompted.

This is the step that costs real time across ~70 tablets. Budget roughly
a minute each, and do it in batches.

## 6. Point the tablets at HTTPS

The URL becomes:

```
https://192.168.1.6/tide-journey
```

Worth forcing HTTP → HTTPS so a mistyped address cannot silently drop
tablets back to the uncacheable version. In `C:\xampp\apache\conf\extra\
httpd-vhosts.conf`:

```apache
<VirtualHost *:80>
    ServerName 192.168.1.6
    Redirect permanent / https://192.168.1.6/
</VirtualHost>
```

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Apache will not start on 443 | Port in use — Skype, IIS or VMware. Check XAMPP's **Netstat**. |
| `ERR_CERT_COMMON_NAME_INVALID` | `subjectAltName` missing from step 2. |
| Warning persists after install | Installed under "User" instead of "CA certificate". |
| Secure context still NO | Still on `http://`. Check the address bar for the padlock. |
| Works on laptop, not tablets | Windows Firewall is blocking 443 on the private network. |

## Before committing to all 70 tablets

Do steps 1–5 for **one** tablet and confirm `check.html` reports all
green. Only then repeat across the fleet.
