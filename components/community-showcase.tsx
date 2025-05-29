"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Download, Share2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface WallpaperItem {
  id: string
  title: string
  creator: {
    name: string
    avatar?: string
  }
  imageUrl: string
  prompt: string
  likes: number
  downloads: number
  tags: string[]
  createdAt: string
}

interface CommunityShowcaseProps {
  items: WallpaperItem[]
  className?: string
}

export function CommunityShowcase({ items, className }: CommunityShowcaseProps) {
  const [selectedItem, setSelectedItem] = useState<WallpaperItem | null>(null)
  const [filter, setFilter] = useState<"trending" | "newest" | "popular">("trending")
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  const filteredItems = items.sort((a, b) => {
    if (filter === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (filter === "popular") {
      return b.downloads - a.downloads
    } else {
      // trending - combination of recent + likes
      const aScore = a.likes * 2 + (Date.now() - new Date(a.createdAt).getTime()) / 86400000
      const bScore = b.likes * 2 + (Date.now() - new Date(b.createdAt).getTime()) / 86400000
      return bScore - aScore
    }
  })

  const handleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleDownload = (imageUrl: string, title: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async (item: WallpaperItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Check out this amazing wallpaper: ${item.title}`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-light">Community Creations</h2>
        <Tabs defaultValue="trending" value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="rounded-full p-1 bg-zinc-900">
            <TabsTrigger value="trending" className="rounded-full text-xs md:text-sm">
              Trending
            </TabsTrigger>
            <TabsTrigger value="newest" className="rounded-full text-xs md:text-sm">
              Newest
            </TabsTrigger>
            <TabsTrigger value="popular" className="rounded-full text-xs md:text-sm">
              Popular
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
            className="cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            <Card className="overflow-hidden border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="aspect-[16/9] relative overflow-hidden">
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <div>
                    <h3 className="text-white font-medium truncate">{item.title}</h3>
                    <p className="text-white/80 text-sm truncate">by {item.creator.name}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(item.id)
                      }}
                    >
                      <Heart className={cn("h-4 w-4", liked[item.id] ? "fill-red-500 text-red-500" : "")} />
                      <span className="sr-only">Like</span>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {liked[item.id] ? item.likes + 1 : item.likes}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(item.imageUrl, item.title)
                      }}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    <span className="text-xs text-muted-foreground">{item.downloads}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem && (
          <DialogContent className="max-w-4xl w-[90vw] p-0 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-full min-h-[300px]">
                <img
                  src={selectedItem.imageUrl || "/placeholder.svg"}
                  alt={selectedItem.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedItem.title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    {selectedItem.creator.avatar ? (
                      <img
                        src={selectedItem.creator.avatar || "/placeholder.svg"}
                        alt={selectedItem.creator.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {selectedItem.creator.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-sm">{selectedItem.creator.name}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Prompt</h4>
                    <p className="text-sm text-muted-foreground">{selectedItem.prompt}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-secondary px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button
                      className="flex-1 rounded-full"
                      onClick={() => handleDownload(selectedItem.imageUrl, selectedItem.title)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => handleShare(selectedItem)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleLike(selectedItem.id)}
                    >
                      <Heart className={cn("h-4 w-4", liked[selectedItem.id] ? "fill-red-500 text-red-500" : "")} />
                      <span className="sr-only">Like</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
