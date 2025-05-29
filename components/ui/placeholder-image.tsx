import { cn } from "@/lib/utils"

interface PlaceholderImageProps {
  text?: string
  width?: number
  height?: number
  className?: string
}

export function PlaceholderImage({ text = "Image", width = 640, height = 360, className }: PlaceholderImageProps) {
  const aspectRatio = width / height
  const paddingTop = `${(1 / aspectRatio) * 100}%`

  return (
    <div
      className={cn("relative w-full bg-zinc-800 flex items-center justify-center overflow-hidden", className)}
      style={{ paddingTop }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm font-medium">{text}</div>
    </div>
  )
}
