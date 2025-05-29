import { NextResponse } from "next/server"
import { StabilityClient } from "@/utils/stabilityClient"

export async function POST(request: Request) {
  try {
    const { imageBase64, prompt, style } = await request.json()

    if (!imageBase64) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    const apiKey = process.env.STABILITY_API_KEY
    if (!apiKey) {
      console.error("STABILITY_API_KEY is not defined in environment variables")
      return NextResponse.json({ error: "API key configuration error" }, { status: 500 })
    }

    console.log(`Generating image from reference with prompt: "${prompt}", style: ${style}`)

    const stabilityClient = new StabilityClient(apiKey)

    try {
      // First try image-to-image generation
      const images = await stabilityClient.generateFromImage(imageBase64, prompt, {
        samples: 1, // Start with just 1 sample to avoid potential limits
        style: style || "enhance",
      })

      return NextResponse.json({ images })
    } catch (error) {
      console.error("Error in image-to-image generation:", error)

      // Fallback to text-to-image if image-to-image fails
      console.log("Falling back to text-to-image generation")

      const fallbackPrompt = prompt
        ? `Create an image similar to: ${prompt}`
        : "Create a beautiful wallpaper with vibrant colors"

      const images = await stabilityClient.generateImage(fallbackPrompt, {
        samples: 4,
        style: style || "photographic",
      })

      return NextResponse.json({
        images,
        warning: "Image-to-image generation failed. Falling back to text-to-image generation.",
      })
    }
  } catch (error) {
    console.error("Error in generate-from-image API route:", error)
    return NextResponse.json(
      {
        error: "Failed to generate image from reference",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
