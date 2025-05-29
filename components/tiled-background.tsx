"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export function TiledBackground() {
  const [randomImages, setRandomImages] = useState<string[]>([])

  useEffect(() => {
    const wallpapers = [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%201-KGsuKLi0XNK3Lz4kA7uSbrRO317lKe.webp",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%202-FjSAjUuc61eyzbWS72P8z68KWE6qr2.webp",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%2013-aYBDsBEF5WVz3vTq0465yC56DHPOo1.webp",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%205-zhHBnSHkw7efnAOmQryGSPvcmMbD4G.webp",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%208-98GAwGfvdZeuXKBCIWujMaM7z4SIpW.webp",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%206-uZqYq2mtxDSwJBJYt2qqYqTst8Z9bl.webp",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%207-jiPeteMRhptjEJ6iqfzKBaPXaT2344.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%2012-LYZ9sDJmpMwWiFCA7Tqq8lu6GmiGsF.webp",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%2017-2ql9BlQrGhqQjObEuFFXToUWHMKTqZ.webp",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%209-5OS3V9Afxe6sdpngmdy4VK82jYnKuA.webp",
    ]

    // Randomly select 4 images for the background
    const shuffled = [...wallpapers].sort(() => 0.5 - Math.random())
    setRandomImages(shuffled.slice(0, 4))
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10"></div>
      <div className="grid grid-cols-2 h-full w-full">
        {randomImages.map((image, index) => (
          <div key={index} className="relative overflow-hidden">
            <Image
              src={image || "/placeholder.svg"}
              alt="Background wallpaper"
              fill
              className="object-cover opacity-20"
              priority={index < 2}
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  )
}
