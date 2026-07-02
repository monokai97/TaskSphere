import { createHmac, randomBytes } from 'crypto'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Encode(buffer: Buffer): string {
  let bits = 0
  let value = 0
  let result = ''
  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      result += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }
  return result
}

function base32Decode(str: string): Buffer {
  const cleaned = str.replace(/[^A-Za-z2-7]/g, '').toUpperCase()
  const bytes: number[] = []
  let buffer = 0
  let bitsLeft = 0
  for (const char of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(char)
    if (idx === -1) continue
    buffer = (buffer << 5) | idx
    bitsLeft += 5
    if (bitsLeft >= 8) {
      bytes.push((buffer >>> (bitsLeft - 8)) & 255)
      bitsLeft -= 8
    }
  }
  return Buffer.from(bytes)
}

export function generateSecret(): string {
  return base32Encode(randomBytes(20))
}

function totp(secret: string, timeStep: number): string {
  const decoded = base32Decode(secret)
  const counter = Buffer.alloc(8)
  for (let i = 7; i >= 0; i--) {
    counter[i] = timeStep & 255
    timeStep = timeStep >>> 8
  }
  const hmac = createHmac('sha1', decoded).update(counter).digest()
  const offset = hmac[hmac.length - 1] & 15
  const code =
    ((hmac[offset] & 127) << 24) |
    ((hmac[offset + 1] & 255) << 16) |
    ((hmac[offset + 2] & 255) << 8) |
    (hmac[offset + 3] & 255)
  return String(code % 1000000).padStart(6, '0')
}

export function verifyTOTP(token: string, secret: string): boolean {
  const now = Math.floor(Date.now() / 1000)
  for (let i = -1; i <= 1; i++) {
    const expected = totp(secret, Math.floor(now / 30) + i)
    if (expected === token) return true
  }
  return false
}

export function generateProvisioningURI(
  secret: string,
  label: string,
  issuer: string,
): string {
  const encodedLabel = encodeURIComponent(label)
  const encodedIssuer = encodeURIComponent(issuer)
  return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`
}

export function generateBackupCodes(count: number): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase().slice(0, 8)
    const formatted = `${code.slice(0, 4)}-${code.slice(4)}`
    codes.push(formatted)
  }
  return codes
}
