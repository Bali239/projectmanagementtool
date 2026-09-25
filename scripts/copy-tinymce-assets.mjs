import { cpSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const tinymcePackage = resolve(projectRoot, "node_modules/tinymce")
const publicTinymce = resolve(projectRoot, "public/tinymce")

mkdirSync(resolve(projectRoot, "public"), { recursive: true })
cpSync(tinymcePackage, publicTinymce, { recursive: true, force: true })
console.log("Copied TinyMCE runtime assets to public/tinymce")
