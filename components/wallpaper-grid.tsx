"use client"

import { useState, useEffect } from "react"

// Define wallpaper data with titles and URLs - updated with the new images
const wallpaperData = [
  {
    title: "Geometric Pattern",
    alt: "Geometric pattern with red and blue flower shapes",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%201-KGsuKLi0XNK3Lz4kA7uSbrRO317lKe.webp",
  },
  {
    title: "Fantasy Castle",
    alt: "Fantasy castle floating above clouds with magical goddess",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%202-FjSAjUuc61eyzbWS72P8z68KWE6qr2.webp",
  },
  {
    title: "Zen Garden",
    alt: "Zen garden with bonsai tree and raked sand patterns",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%2013-aYBDsBEF5WVz3vTq0465yC56DHPOo1.webp",
  },
  {
    title: "Rainforest Stream",
    alt: "Lush rainforest with sunlight streaming through trees and clear stream",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%205-zhHBnSHkw7efnAOmQryGSPvcmMbD4G.webp",
  },
  {
    title: "Minimalist Office",
    alt: "Minimalist zen-inspired home office with light wood tones",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%208-98GAwGfvdZeuXKBCIWujMaM7z4SIpW.webp",
  },
  {
    title: "Pastel Mountains",
    alt: "Stylized illustration of mountains and clouds in pastel colors",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%206-uZqYq2mtxDSwJBJYt2qqYqTst8Z9bl.webp",
  },
  {
    title: "Countryside Path",
    alt: "Serene countryside road lined with trees in painterly style",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%207-jiPeteMRhptjEJ6iqfzKBaPXaT2344.png",
  },
  {
    title: "Cozy Interior",
    alt: "Cozy living room with plants, warm lighting and natural wood elements",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%2012-LYZ9sDJmpMwWiFCA7Tqq8lu6GmiGsF.webp",
  },
  {
    title: "Vintage Mountains",
    alt: "Vintage-style illustration of mountain ranges on aged paper",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%2017-2ql9BlQrGhqQjObEuFFXToUWHMKTqZ.webp",
  },
  {
    title: "Gradient Sphere",
    alt: "Minimalist circular gradient in soft blue and purple tones",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%209-5OS3V9Afxe6sdpngmdy4VK82jYnKuA.webp",
  },
  {
    title: "Botanical Line Art",
    alt: "Minimalist black and white line drawing of botanical elements",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%2015-1fDAd8LAiQgJv1qjYj0A5YKK6edyRN.webp",
  },
  {
    title: "Minimalist Circle",
    alt: "Minimalist grayscale image with large circular outline on concrete wall",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%2011-7Qru155uDGeLRQQTRWytjs4Y8lFZem.webp",
  },
]

export function WallpaperGrid() {
  // Use a client-side only state to avoid hydration mismatch
  const [loaded, setLoaded] = useState(false)
  // Use a fixed set of wallpapers instead of random selection
  const [displayWallpapers, setDisplayWallpapers] = useState<typeof wallpaperData>([])

  useEffect(() => {
    setLoaded(true)
    // Use a deterministic selection instead of random
    setDisplayWallpapers(wallpaperData.slice(0, 12))
  }, [])

  // Don't render anything during SSR
  if (!loaded) {
    return null
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
      {displayWallpapers.map((wallpaper, index) => (
        <div key={index} className="aspect-[1/1] rounded-lg md:rounded-xl overflow-hidden shadow-md relative group">
          {/* Fallback colored div that's always visible */}
          <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
            <span className="text-white font-medium text-xs md:text-sm">{wallpaper.title}</span>
          </div>

          <div className="absolute inset-0 w-full h-full">
            <img
              src={wallpaper.url || "/placeholder.svg"}
              alt={wallpaper.alt}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              loading={index > 5 ? "lazy" : "eager"} // Lazy load additional images
            />
          </div>

          {/* Hover overlay with title */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2 md:p-3">
            <p className="text-white font-medium text-xs md:text-sm">{wallpaper.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
