// Build-time QR generation. `qrcode-generator` is a devDependency: it runs
// here on the laptop and emits a static SVG, so nothing is shipped to the
// tablets and no CDN is contacted at runtime.
import qrcode from 'qrcode-generator'

export function qrSvg(text, { scale = 8, quiet = 4 } = {}) {
  const qr = qrcode(0, 'M') // version 0 = auto-size, ECC level M
  qr.addData(text)
  qr.make()

  const count = qr.getModuleCount()
  const dim = (count + quiet * 2) * scale
  let path = ''
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        path += `M${(c + quiet) * scale} ${(r + quiet) * scale}h${scale}v${scale}h-${scale}z`
      }
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" ` +
    `viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges" role="img" ` +
    `aria-label="QR code for ${text}">` +
    `<rect width="${dim}" height="${dim}" fill="#fff"/>` +
    `<path d="${path}" fill="#000"/></svg>`
  )
}
