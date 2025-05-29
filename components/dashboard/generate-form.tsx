"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Download, ImageIcon, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

interface GenerateFormProps {
  userId: string
  canGenerate: boolean
  planType: string
  currentUsage: number
  usageLimit: number
}

export function GenerateForm({ userId, canGenerate, planType, currentUsage, usageLimit }: GenerateFormProps) {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("photographic")
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  // Add a new state to track the save button status
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate wallpapers",
        variant: "destructive",
      })
      return
    }

    if (!canGenerate) {
      toast({
        title: "Usage limit reached",
        description: "You've reached your monthly limit. Please upgrade your plan for more wallpapers.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedImages([])
    setSelectedImage(null)
    setError(null)

    try {
      console.log("Sending request to generate images with:", { prompt, style, aspectRatio })

      // Call the API route to generate images
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          style,
          aspectRatio,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("API error response:", data)
        throw new Error(data.error || data.details || "Failed to generate images")
      }

      if (!data.images || data.images.length === 0) {
        throw new Error("No images were generated")
      }

      console.log(`Received ${data.images.length} generated images`)
      setGeneratedImages(data.images)
      setSelectedImage(data.images[0])

      // Update usage count in the database
      const { error: dbError } = await supabaseClient
        .from("usage")
        .update({
          count: currentUsage + 1,
          last_generated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (dbError) {
        console.error("Error updating usage count:", dbError)
      }

      toast({
        title: "Success",
        description: "Your wallpapers have been generated!",
      })
    } catch (error) {
      console.error("Error generating images:", error)
      setError(error instanceof Error ? error.message : "Failed to generate wallpapers. Please try again.")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate wallpapers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Update the handleSave function to use the button state for feedback
  const handleSave = async () => {
    if (!selectedImage) return

    try {
      // Update button state to saving
      setSaveStatus("saving")

      const { data, error } = await supabaseClient
        .from("wallpapers")
        .insert({
          user_id: userId,
          prompt: prompt,
          style: style,
          aspect_ratio: aspectRatio,
          image_url: selectedImage,
          // Let Supabase handle created_at and updated_at with default values
        })
        .select()

      if (error) throw error

      // Update button state to saved
      setSaveStatus("saved")

      // Reset button state after 2 seconds
      setTimeout(() => {
        setSaveStatus("idle")
      }, 2000)

      console.log("Saved wallpaper:", data)
    } catch (error) {
      console.error("Error saving wallpaper:", error)
      // Reset button state on error
      setSaveStatus("idle")

      // Show error toast only on failure
      toast({
        title: "Error saving wallpaper",
        description: "Failed to save wallpaper. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Calculate usage percentage
  const usagePercentage =
    usageLimit === Number.POSITIVE_INFINITY ? 0 : Math.min(Math.round((currentUsage / usageLimit) * 100), 100)

  // Get aspect ratio display text
  const getAspectRatioText = (ratio: string) => {
    switch (ratio) {
      case "16:9":
        return "16:9 (Widescreen)"
      case "21:9":
        return "21:9 (Ultrawide)"
      case "4:3":
        return "4:3 (Standard)"
      case "1:1":
        return "1:1 (Square)"
      case "9:16":
        return "9:16 (Mobile)"
      default:
        return ratio
    }
  }

  return (
    <div className="space-y-6">
      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Create New Wallpaper</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canGenerate && (
            <div className="rounded-md bg-yellow-500/10 p-4 text-sm text-yellow-500 flex items-start gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Usage limit reached</p>
                <p className="mt-1">
                  You've used {currentUsage} out of {usageLimit === Number.POSITIVE_INFINITY ? "unlimited" : usageLimit}{" "}
                  wallpapers this month.
                </p>
                <Link href="/dashboard/pricing" className="text-yellow-400 hover:underline mt-2 inline-block">
                  Upgrade your plan for more
                </Link>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-500 flex items-start gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error generating wallpapers</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="usage-progress">
              Usage ({currentUsage}/{usageLimit === Number.POSITIVE_INFINITY ? "∞" : usageLimit})
            </Label>
            <Progress value={usagePercentage} className="h-2 rounded-full" id="usage-progress" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt-input">Describe your wallpaper</Label>
            <Textarea
              id="prompt-input"
              placeholder="A serene mountain landscape with a lake at sunset, photographic style"
              className="min-h-[100px] rounded-xl resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="style-select">Style</Label>
              <Select value={style} onValueChange={(value) => setStyle(value)}>
                <SelectTrigger id="style-select" className="rounded-xl">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photographic">Photographic</SelectItem>
                  <SelectItem value="digital-art">Digital Art</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="fantasy-art">Fantasy Art</SelectItem>
                  <SelectItem value="neon-punk">Neon Punk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspect-ratio-select">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value)}>
                <SelectTrigger id="aspect-ratio-select" className="rounded-xl">
                  <SelectValue placeholder="Select aspect ratio">{getAspectRatioText(aspectRatio)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                  <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                  <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="9:16">9:16 (Mobile)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !canGenerate}
            className="w-full rounded-full h-10 md:h-12 text-sm md:text-base bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" aria-hidden="true" />
                Generating...
              </>
            ) : (
              <>Generate Wallpapers</>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-medium">Generated Wallpapers</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {generatedImages.map((imageUrl, index) => (
              <div
                key={index}
                className={`group relative aspect-[16/9] overflow-hidden rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${
                  selectedImage === imageUrl ? "ring-2 ring-blue-400 scale-[1.02]" : ""
                }`}
                onClick={() => setSelectedImage(imageUrl)}
              >
                <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">Generated {index + 1}</span>
                </div>
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Generated wallpaper ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="mt-1 flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Download logic
                        const link = document.createElement("a")
                        link.href = imageUrl
                        link.download = `wallpaper-${index + 1}.jpg`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
                    >
                      <Download className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only">Download wallpaper</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedImage && (
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedImages([])
                  setSelectedImage(null)
                }}
                className="rounded-full"
              >
                Regenerate
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-full gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={saveStatus !== "idle"}
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : saveStatus === "saved" ? (
                  <>
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    Saved!
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    Save Selected
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
