"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@supabase/supabase-js"

interface SaveWallpaperFormProps {
  imageUrl: string
  prompt?: string
  width: number
  height: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function SaveWallpaperForm({
  imageUrl,
  prompt = "",
  width,
  height,
  onSuccess,
  onCancel,
}: SaveWallpaperFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [tags, setTags] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save wallpapers",
        variant: "destructive",
      })
      return
    }

    if (!title) {
      toast({
        title: "Title required",
        description: "Please provide a title for your wallpaper",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://etfyosmeksfpskrlilbu.supabase.co"
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseAnonKey) {
        throw new Error("Supabase anon key is missing")
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Process tags
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      // Save wallpaper to database
      const { error } = await supabase.from("wallpapers").insert({
        user_id: user.id,
        image_url: imageUrl,
        prompt,
        style: "custom", // Or any default style
        aspect_ratio: `${width}:${height}`,
        // Let Supabase handle created_at and updated_at
      })

      if (error) {
        throw error
      }

      toast({
        title: "Wallpaper saved",
        description: "Your wallpaper has been saved successfully",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error saving wallpaper:", error)
      toast({
        title: "Error saving wallpaper",
        description: "There was an error saving your wallpaper. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My awesome wallpaper"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of your wallpaper"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="nature, abstract, colorful"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
        <Label htmlFor="is-public">Make this wallpaper public</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Wallpaper"}
        </Button>
      </div>
    </form>
  )
}
