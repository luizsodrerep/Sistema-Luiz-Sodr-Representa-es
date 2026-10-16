import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CRM Luiz Sodré Representações",
    short_name: "CRM Luiz Sodré",
    description: "Sistema de gestão comercial e financeira",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    share_target: {
      action: "/api/central-documentos?origem=android",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        files: [
          {
            name: "files",
            accept: [
              "application/pdf", ".pdf",
              "image/jpeg", ".jpg", ".jpeg",
              "image/png", ".png",
              "image/webp", ".webp",
              ".heic", ".heif",
              ".doc", ".docx",
              ".xls", ".xlsx",
              ".csv", ".ofx",
              ".txt", ".xml", ".eml"
            ]
          }
        ]
      }
    },
    icons: [
      {
        src: "/branding/logo-lsr-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/branding/logo-lsr-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
