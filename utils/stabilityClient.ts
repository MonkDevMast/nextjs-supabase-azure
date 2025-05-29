type StabilityResponse = {
  artifacts: Array<{
    base64: string
    seed: number
    finishReason: string
  }>
}

// Valid style presets for Stability API
const VALID_STYLE_PRESETS = [
  "analog-film",
  "anime",
  "cinematic",
  "comic-book",
  "digital-art",
  "enhance",
  "fantasy-art",
  "isometric",
  "line-art",
  "low-poly",
  "modeling-compound",
  "neon-punk",
  "origami",
  "photographic",
  "pixel-art",
  "3d-model",
  "tile-texture",
]

// SDXL recommended dimensions
const SDXL_DIMENSIONS = [
  { width: 1024, height: 1024 }, // 1:1
  { width: 1152, height: 896 }, // 9:7
  { width: 896, height: 1152 }, // 7:9
  { width: 1216, height: 832 }, // 19:13
  { width: 832, height: 1216 }, // 13:19
  { width: 1344, height: 768 }, // 7:4
  { width: 768, height: 1344 }, // 4:7
  { width: 1536, height: 640 }, // 12:5
  { width: 640, height: 1536 }, // 5:12
]

export class StabilityClient {
  private apiKey: string

  constructor(apiKey: string) {
    if (!apiKey) {
      console.error("Stability API key is required but was not provided")
      throw new Error("Stability API key is required")
    }
    this.apiKey = apiKey
  }

  // Helper function to find the closest SDXL-compatible dimensions
  private getClosestSDXLDimensions(width: number, height: number): { width: number; height: number } {
    // Ensure dimensions are multiples of 8
    width = Math.round(width / 8) * 8
    height = Math.round(height / 8) * 8

    // Check if dimensions are already in the recommended list
    for (const dim of SDXL_DIMENSIONS) {
      if (dim.width === width && dim.height === height) {
        return { width, height }
      }
    }

    // Find the closest aspect ratio match from recommended dimensions
    const targetRatio = width / height
    let closestDimension = SDXL_DIMENSIONS[0]
    let closestDiff = Math.abs(closestDimension.width / closestDimension.height - targetRatio)

    for (const dim of SDXL_DIMENSIONS) {
      const diff = Math.abs(dim.width / dim.height - targetRatio)
      if (diff < closestDiff) {
        closestDiff = diff
        closestDimension = dim
      }
    }

    return closestDimension
  }

  async generateImage(
    prompt: string,
    options: {
      width?: number
      height?: number
      cfgScale?: number
      steps?: number
      samples?: number
      style?: string
    } = {},
  ): Promise<string[]> {
    const defaultOptions = {
      width: 1024,
      height: 1024, // Default to square (1:1)
      cfgScale: 7,
      steps: 30,
      samples: 4,
    }

    const mergedOptions = { ...defaultOptions, ...options }

    // Get SDXL-compatible dimensions
    const sdxlDimensions = this.getClosestSDXLDimensions(mergedOptions.width, mergedOptions.height)
    mergedOptions.width = sdxlDimensions.width
    mergedOptions.height = sdxlDimensions.height

    console.log(`Using SDXL-compatible dimensions: ${mergedOptions.width}x${mergedOptions.height}`)

    // Validate style preset
    if (mergedOptions.style && !VALID_STYLE_PRESETS.includes(mergedOptions.style.toLowerCase())) {
      console.warn(`Invalid style preset: ${mergedOptions.style}. Using 'photographic' instead.`)
      mergedOptions.style = "photographic"
    }

    // Use SDXL as the primary engine
    const primaryEngine = "stable-diffusion-xl-1024-v1-0"

    try {
      console.log(`Generating image with engine: ${primaryEngine}`)
      console.log(`Prompt: "${prompt}"`)
      console.log(`Options:`, mergedOptions)

      const response = await fetch(`https://api.stability.ai/v1/generation/${primaryEngine}/text-to-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1,
            },
          ],
          cfg_scale: mergedOptions.cfgScale,
          width: mergedOptions.width,
          height: mergedOptions.height,
          steps: mergedOptions.steps,
          samples: mergedOptions.samples,
          style_preset: mergedOptions.style?.toLowerCase(),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Stability API error: ${response.status} ${errorText}`)
        throw new Error(`Stability API error: ${response.status} ${errorText}`)
      }

      const data = (await response.json()) as StabilityResponse
      console.log(`Successfully generated ${data.artifacts.length} images`)

      return data.artifacts.map((artifact) => `data:image/png;base64,${artifact.base64}`)
    } catch (error) {
      console.error("Error generating images:", error)
      throw error
    }
  }
}
