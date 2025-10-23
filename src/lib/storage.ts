import fs from "node:fs"
import path from "node:path"
import { google } from "googleapis"

type PutResult = { storageKey: string; size: number; mimeType: string; filename: string }
const provider = (process.env.FILE_STORAGE_PROVIDER || "gdrive").toLowerCase()

// -------- Google Drive auth --------
function getDriveClient() {
  const folderId = process.env.GDRIVE_FOLDER_ID || ""
  if (!folderId) throw new Error("GDRIVE_FOLDER_ID is required")
  let credsStr = process.env.GDRIVE_SERVICE_ACCOUNT || ""
  if (!credsStr && process.env.GDRIVE_KEY_BASE64) {
    credsStr = Buffer.from(process.env.GDRIVE_KEY_BASE64, "base64").toString("utf8")
  }
  if (!credsStr) throw new Error("GDRIVE_SERVICE_ACCOUNT or GDRIVE_KEY_BASE64 is required")
  const creds = JSON.parse(credsStr)
  const jwt = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/drive"]
  })
  const drive = google.drive({ version: "v3", auth: jwt })
  return { drive, folderId }
}

// -------- Upload file --------
export async function putFile(key: string, body: Buffer, contentType: string): Promise<PutResult> {
  if (provider === "local") {
    const root = path.resolve(process.cwd(), "uploads")
    fs.mkdirSync(path.join(root, path.dirname(key)), { recursive: true })
    const full = path.join(root, key)
    fs.writeFileSync(full, body)
    return { storageKey: key, size: body.length, mimeType: contentType, filename: path.basename(key) }
  }
  // Google Drive
  const { drive, folderId } = getDriveClient()
  const res = await drive.files.create({
    requestBody: { name: path.basename(key), parents: [folderId] },
    media: { mimeType: contentType, body: Buffer.from(body) }
  })
  const fileId = res.data.id as string
  return { storageKey: fileId, size: body.length, mimeType: contentType, filename: path.basename(key) }
}

// -------- Download file (returns Buffer + mime for Response) --------
export async function getFileBuffer(storageKey: string): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  if (provider === "local") {
    const full = path.resolve(process.cwd(), "uploads", storageKey)
    const buffer = fs.readFileSync(full)
    return { buffer, filename: path.basename(storageKey), mimeType: "application/octet-stream" }
  }
  const { drive } = getDriveClient()
  // Get file metadata to obtain name/mimeType
  const meta = await drive.files.get({ fileId: storageKey, fields: "name, mimeType" })
  const name = meta.data.name || "download"
  const mime = meta.data.mimeType || "application/octet-stream"
  // Download content
  const resp = await drive.files.get({ fileId: storageKey, alt: "media" }, { responseType: "arraybuffer" })
  const buffer = Buffer.from(resp.data as any)
  return { buffer, filename: name, mimeType: mime }
}
