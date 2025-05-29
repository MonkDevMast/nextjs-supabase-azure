"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function ExpandedFAQ() {
  return (
    <Accordion type="single" collapsible className="w-full rounded-xl border border-zinc-800 overflow-hidden">
      <AccordionItem value="item-1">
        <AccordionTrigger className="px-4 md:px-6 hover:no-underline">
          <span className="text-base md:text-lg font-medium">Can I use wallpapers commercially?</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 md:px-6 text-muted-foreground">
          Yes, paid plans (Starter and above) include commercial usage rights for all generated wallpapers. The Free
          plan is limited to personal use only. You can use commercially licensed wallpapers for your business website,
          social media, marketing materials, or any commercial project without additional fees.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger className="px-4 md:px-6 hover:no-underline">
          <span className="text-base md:text-lg font-medium">How do I download high-res wallpapers?</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 md:px-6 text-muted-foreground">
          After generating a wallpaper, you'll see download options for different resolutions based on your subscription
          plan. Click the download button next to your preferred resolution. Pro and Unlimited plans provide access to
          4K resolution downloads, while the Starter plan supports up to 2K resolution.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger className="px-4 md:px-6 hover:no-underline">
          <span className="text-base md:text-lg font-medium">Is there a generation limit?</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 md:px-6 text-muted-foreground">
          Yes, each plan has different generation limits. The Free plan allows 5 wallpapers per month, the Starter plan
          includes 100 wallpapers per month, and the Unlimited plan offers unlimited wallpaper generation. Your limit
          resets at the beginning of each billing cycle. You'll receive a notification when you're approaching your
          limit.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-4">
        <AccordionTrigger className="px-4 md:px-6 hover:no-underline">
          <span className="text-base md:text-lg font-medium">Can I cancel my subscription anytime?</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 md:px-6 text-muted-foreground">
          Yes, you can cancel your subscription at any time through your account settings. When you cancel, you'll
          maintain access to your current plan until the end of your billing period. There are no cancellation fees, and
          we don't offer prorated refunds for partial months. After cancellation, your account will revert to the Free
          plan.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-5">
        <AccordionTrigger className="px-4 md:px-6 hover:no-underline">
          <span className="text-base md:text-lg font-medium">What image formats are available?</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 md:px-6 text-muted-foreground">
          WallScape.io provides wallpapers in multiple formats including JPG, PNG, and WEBP. The default format is WEBP
          for optimal quality and file size, but you can select your preferred format when downloading. All paid plans
          allow you to choose your format, while the Free plan is limited to JPG format only.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-6">
        <AccordionTrigger className="px-4 md:px-6 hover:no-underline">
          <span className="text-base md:text-lg font-medium">Do I need an account?</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 md:px-6 text-muted-foreground">
          Yes, a free account is required to generate and download wallpapers. Creating an account allows us to track
          your usage limits, save your generation history, and provide personalized recommendations. Sign up is quick
          and only requires an email address. You can also sign in with Google for a faster experience.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-7">
        <AccordionTrigger className="px-4 md:px-6 hover:no-underline">
          <span className="text-base md:text-lg font-medium">Can I customize wallpaper size?</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 md:px-6 text-muted-foreground">
          Yes, all plans allow you to choose from standard aspect ratios like 16:9 (widescreen), 21:9 (ultrawide), 4:3
          (standard), and 9:16 (mobile). The Unlimited plan additionally supports custom aspect ratios and dimensions,
          allowing you to create wallpapers that perfectly fit any device or display configuration.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-8">
        <AccordionTrigger className="px-4 md:px-6 hover:no-underline">
          <span className="text-base md:text-lg font-medium">How does the AI work?</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 md:px-6 text-muted-foreground">
          WallScape.io uses advanced generative AI technology to create unique wallpapers based on your text prompts or
          reference images. Our system employs stable diffusion models that have been trained on millions of images to
          understand and generate high-quality, visually appealing content. The AI interprets your descriptions and
          produces images that match your creative vision.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-9">
        <AccordionTrigger className="px-4 md:px-6 hover:no-underline">
          <span className="text-base md:text-lg font-medium">Do you offer refunds?</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 md:px-6 text-muted-foreground">
          Yes, we offer a 7-day money-back guarantee for all new subscriptions. If you're not satisfied with our
          service, you can request a full refund within the first 7 days of your initial subscription. Contact our
          support team at support@wallscape.io to process your refund. After the 7-day period, we don't offer prorated
          refunds for canceled subscriptions.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-10">
        <AccordionTrigger className="px-4 md:px-6 hover:no-underline">
          <span className="text-base md:text-lg font-medium">Is there an API?</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 md:px-6 text-muted-foreground">
          Yes, we offer API access for Pro and Unlimited plan subscribers. Our REST API allows developers to
          programmatically generate wallpapers, access their library, and integrate WallScape.io into their applications
          or workflows. API usage is subject to the same monthly limits as your subscription plan. Comprehensive API
          documentation is available in our developer portal.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

// Add a default export as well to ensure it can be imported either way
export default ExpandedFAQ
