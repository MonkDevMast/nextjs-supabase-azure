import { createServerSupabaseClient } from "@/lib/supabase"

async function setupStorage() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if avatars bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      throw bucketsError
    }

    const avatarsBucketExists = buckets.some((bucket) => bucket.name === "avatars")

    if (!avatarsBucketExists) {
      // Create avatars bucket
      const { error: createError } = await supabase.storage.createBucket("avatars", {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB
      })

      if (createError) {
        throw createError
      }

      console.log("Created avatars bucket")
    } else {
      console.log("Avatars bucket already exists")
    }

    // Set up public access policy for avatars bucket
    const { error: policyError } = await supabase.storage.from("avatars").createSignedUrl("test.txt", 60)

    if (policyError && policyError.message.includes("not found")) {
      // Create a test file to set up policies
      const { error: uploadError } = await supabase.storage.from("avatars").upload("test.txt", new Blob(["test"]))

      if (uploadError) {
        throw uploadError
      }

      // Make bucket public
      const { error: updateError } = await supabase.storage.updateBucket("avatars", {
        public: true,
      })

      if (updateError) {
        throw updateError
      }

      // Clean up test file
      await supabase.storage.from("avatars").remove(["test.txt"])

      console.log("Set up public access for avatars bucket")
    }

    console.log("Storage setup complete")
  } catch (error) {
    console.error("Error setting up storage:", error)
  }
}

// Run the setup
setupStorage()
