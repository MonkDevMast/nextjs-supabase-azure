import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface Wallpaper {
  id: number
  title: string
  prompt: string
  url: string
  date?: string
}

interface DashboardWallpapersProps {
  wallpapers: Wallpaper[]
}

export function DashboardWallpapers({ wallpapers }: DashboardWallpapersProps) {
  return (
    <>
      {wallpapers.map((wallpaper) => (
        <div
          key={wallpaper.id}
          className={cn(
            "group relative aspect-[16/9] overflow-hidden rounded-lg md:rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:scale-[1.02]",
          )}
        >
          <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
            <span className="text-white font-medium text-sm md:text-base">{wallpaper.title}</span>
          </div>
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={wallpaper.url || "/placeholder.svg"}
              alt={wallpaper.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-2 md:p-3 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="text-white font-medium text-xs md:text-sm line-clamp-1">{wallpaper.title}</p>
            <p className="text-zinc-300 text-xs line-clamp-1">{wallpaper.prompt}</p>
            {wallpaper.date && <p className="text-zinc-400 text-xs mt-1">{wallpaper.date}</p>}
            <div className="mt-2 flex items-center gap-2">
              <Button size="icon" variant="secondary" className="h-7 w-7 md:h-8 md:w-8 rounded-full">
                <Download className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
                <span className="sr-only">Download wallpaper</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
