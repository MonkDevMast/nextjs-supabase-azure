import { NextResponse } from "next/server"
import { StabilityClient } from "@/utils/stabilityClient"

export async function POST(request: Request) {
  try {
    const { prompt, style, aspectRatio } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const apiKey = process.env.STABILITY_API_KEY
    if (!apiKey) {
      console.error("STABILITY_API_KEY is not defined in environment variables")
      return NextResponse.json(
        {
          error: "API configuration error",
          details: "The image generation service is currently unavailable. Please check your API key configuration.",
        },
        { status: 503 },
      )
    }

    // SDXL compatible dimensions
    // SDXL requires dimensions to be multiples of 8 and within specific ranges
    let width = 1024
    let height = 1024 // Default square

    // Set dimensions based on aspect ratio
    // Using SDXL-compatible dimensions
    if (aspectRatio === "16:9") {
      width = 1024
      height = 576
      // Adjust to SDXL compatible dimensions
      width = 1024
      height = 576
      // SDXL requires specific dimensions, let's use a close match
      width = 1024
      height = 576

      // Try one of the recommended SDXL dimensions
      width = 1344
      height = 768 // Close to 16:9 (1.75 aspect ratio)
    } else if (aspectRatio === "21:9") {
      // Ultrawide - use a close SDXL compatible ratio
      width = 1536
      height = 640 // Close to 21:9 (2.4 aspect ratio)
    } else if (aspectRatio === "4:3") {
      width = 1024
      height = 768 // 4:3 ratio, SDXL compatible
    } else if (aspectRatio === "1:1") {
      width = 1024
      height = 1024 // Square, SDXL compatible
    } else if (aspectRatio === "9:16") {
      // Portrait/mobile
      width = 768
      height = 1344 // Close to 9:16 (0.57 aspect ratio)
    }

    console.log(`Generating image with prompt: "${prompt}", style: ${style}, aspectRatio: ${aspectRatio}`)
    console.log(`Using dimensions: ${width}x${height}`)

    // Map our style names to Stability AI style presets
    let stabilityStyle = style
    if (style === "digital-art") stabilityStyle = "digital-art"
    if (style === "anime") stabilityStyle = "anime"
    if (style === "cinematic") stabilityStyle = "cinematic"
    if (style === "fantasy-art") stabilityStyle = "fantasy-art"
    if (style === "neon-punk") stabilityStyle = "neon-punk"
    if (style === "photographic") stabilityStyle = "photographic"

    try {
      const stabilityClient = new StabilityClient(apiKey)
      const images = await stabilityClient.generateImage(prompt, {
        width,
        height,
        samples: 4,
        style: stabilityStyle,
      })

      console.log(`Successfully generated ${images.length} images`)
      return NextResponse.json({ images })
    } catch (stabilityError) {
      console.error("Stability API error:", stabilityError)

      // Try a fallback approach with direct fetch to the API
      console.log("Attempting direct API call as fallback...")

      const engineId = "stable-diffusion-xl-1024-v1-0" // Use SDXL as fallback

      const response = await fetch(`https://api.stability.ai/v1/generation/${engineId}/text-to-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1,
            },
          ],
          cfg_scale: 7,
          width: width,
          height: height,
          steps: 30,
          samples: 4,
          style_preset: stabilityStyle,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Direct API call failed: ${response.status} ${errorText}`)
        throw new Error(`Stability API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log(`Successfully generated ${data.artifacts.length} images via direct API call`)

      const images = data.artifacts.map((artifact: any) => `data:image/png;base64,${artifact.base64}`)
      return NextResponse.json({ images })
    }
  } catch (error) {
    console.error("Error in generate-image API route:", error)
    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
