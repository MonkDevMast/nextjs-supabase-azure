"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/supabase"
import { ProfileEditForm } from "./profile-edit-form"
import { Badge } from "@/components/ui/badge"
import { Globe, MapPin, LinkIcon, Mail } from "lucide-react"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface ProfileViewProps {
  profile: Profile | null
  userEmail: string
}

export function ProfileView({ profile, userEmail }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (!profile) {
    return (
      <Card className="apple-card">
        <CardContent className="p-6">
          <p className="text-zinc-400">Profile information not available.</p>
        </CardContent>
      </Card>
    )
  }

  // Get the first letter of the display name for the avatar fallback
  const displayName = profile.display_name || userEmail.split("@")[0]

  // Parse JSON fields
  const socialLinks = (profile.social_links as { [key: string]: string }) || {}

  if (isEditing) {
    return (
      <ProfileEditForm
        profile={profile}
        userEmail={userEmail}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => setIsEditing(false)}
      />
    )
  }

  return (
    <Card className="apple-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-medium">{displayName}</h3>
          <p className="text-zinc-400 flex items-center gap-1">
            <Mail className="h-4 w-4" />
            {userEmail}
          </p>
        </div>

        {profile.bio && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-400">Bio</h4>
            <p className="text-sm">{profile.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.website_url && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-zinc-400" />
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {profile.website_url.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </div>

        {Object.keys(socialLinks).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-400">Social Links</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              ))}
            </div>
          </div>
        )}

        {profile.favorite_styles && profile.favorite_styles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-400">Favorite Styles</h4>
            <div className="flex flex-wrap gap-2">
              {profile.favorite_styles.map((style) => (
                <Badge key={style} variant="secondary">
                  {style}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={() => setIsEditing(true)} className="w-full rounded-full">
          Edit Profile
        </Button>
      </CardFooter>
    </Card>
  )
}
