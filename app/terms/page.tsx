"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  useEffect(() => {
    // Force scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="centered-container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-medium text-xl">WallScape.io</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full text-black">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="py-12 md:py-16">
          <div className="centered-container">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
              <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-6 text-black">Terms of Service</h1>
              <p className="text-gray-500 mb-8">Effective Date: March 21, 2025</p>

              <p className="text-gray-700 mb-8">
                These Terms of Service ("Terms") govern your access to and use of the services provided by WallScape.io,
                including but not limited to our website, applications, APIs, and advanced technology-powered wallpaper
                generation tools ("Service"). These Terms constitute a binding agreement between you ("User," "you," or
                "your") and WallScape.io, LLC ("WallScape.io," "Company," "we," "us," or "our").
              </p>

              <p className="text-gray-700 mb-8">
                By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound
                by these Terms. If you do not agree, you may not use the Service.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">1. Eligibility and Account Registration</h2>
                <p className="text-gray-700">
                  You must be at least thirteen (13) years old to use the Service. If you are under the age of majority
                  in your jurisdiction, you must obtain parental or guardian consent. By registering an account, you
                  agree to provide accurate, complete, and up-to-date information. You are solely responsible for
                  maintaining the confidentiality of your account credentials and for all activities that occur under
                  your account.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">2. Subscription Plans and Payment Terms</h2>
                <p className="text-gray-700 mb-4">
                  Certain features of the Service are available only through a paid subscription. By subscribing, you
                  agree to pay the applicable fees in accordance with your selected plan. Payments are processed via
                  third-party provider Stripe, and you authorize recurring charges to your payment method. All fees are
                  non-refundable, except where required by law.
                </p>
                <p className="text-gray-700">
                  Failure to pay may result in suspension or termination of your access to the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">
                  3. User-Generated Content and advanced technology Outputs
                </h2>
                <p className="text-gray-700 mb-4">
                  You may input data, text, prompts, or upload reference images ("User Content") into the Service. You
                  retain ownership of any advanced technology-generated wallpapers or outputs ("Outputs") you create.
                  Wallify does not claim ownership over your Outputs.
                </p>
                <p className="text-gray-700">
                  By using the Service, you grant Wallify a non-exclusive, worldwide, royalty-free license to use
                  anonymized User Content and Outputs to operate, improve, and promote the Service and our technology
                  models. Wallify will not publicly share User Content or Outputs that can identify you without your
                  consent.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">4. Acceptable Use Policy</h2>
                <p className="text-gray-700 mb-4">
                  You agree not to use the Service to generate or distribute any content that:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Violates applicable laws, regulations, or third-party rights.</li>
                  <li>Infringes on intellectual property rights, privacy, or publicity rights.</li>
                  <li>Contains defamatory, obscene, hateful, or otherwise objectionable material.</li>
                  <li>Attempts to exploit minors or depicts non-consensual acts.</li>
                  <li>Violates any community standards or policies published by Wallify.</li>
                </ul>
                <p className="text-gray-700">
                  Wallify reserves the right to remove content or suspend access at its sole discretion for violations
                  of this section.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">5. Intellectual Property Rights</h2>
                <p className="text-gray-700 mb-4">
                  All rights, title, and interest in the Service, including software, trademarks, user interface design,
                  and technology models, are owned by Wallify or its licensors. You may not reproduce, modify,
                  distribute, reverse-engineer, or create derivative works from any part of the Service except as
                  expressly permitted.
                </p>
                <p className="text-gray-700">
                  Wallify, the Wallify logo, and all related names and marks are trademarks of Wallify, LLC.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">6. Third-Party Services and Integrations</h2>
                <p className="text-gray-700">
                  The Service may integrate with or rely upon third-party services such as Stripe (payments), OpenAI
                  (image generation), or Supabase (data storage). Wallify is not responsible for the performance, data
                  handling, or terms of service of third-party providers. Use of such services may be subject to
                  additional terms imposed by those providers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">7. Beta Features</h2>
                <p className="text-gray-700">
                  Wallify may offer access to beta or pre-release features. These features are provided "as is" and
                  without warranty. Wallify makes no guarantees regarding the performance or availability of beta
                  features and reserves the right to discontinue or modify them at any time.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">8. Termination and Suspension</h2>
                <p className="text-gray-700">
                  Wallify may suspend or terminate your access to the Service at any time, with or without cause or
                  notice. Grounds for termination may include, but are not limited to: violations of these Terms,
                  fraudulent activity, or harm to other users or the Service. Upon termination, your right to use the
                  Service ceases immediately, and Wallify may delete your data and Outputs.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">9. Disclaimer of Warranties</h2>
                <p className="text-gray-700 uppercase">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
                  WALLIFY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A
                  PARTICULAR PURPOSE, NON-INFRINGEMENT, AND AVAILABILITY OR RELIABILITY OF THE SERVICE.
                </p>
                <p className="text-gray-700 uppercase mt-4">
                  WALLIFY DOES NOT GUARANTEE THAT THE SERVICE WILL BE ERROR-FREE, UNINTERRUPTED, OR FREE OF VIRUSES.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">10. Limitation of Liability</h2>
                <p className="text-gray-700 uppercase mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WALLIFY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR
                  GOODWILL, ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE.
                </p>
                <p className="text-gray-700 uppercase">
                  WALLIFY'S TOTAL LIABILITY UNDER THESE TERMS SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO WALLIFY IN THE
                  TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">11. Indemnification</h2>
                <p className="text-gray-700">
                  You agree to indemnify, defend, and hold harmless Wallify and its officers, employees, agents,
                  affiliates, and licensors from any claims, liabilities, damages, losses, and expenses, including legal
                  fees, arising from your use of the Service, your violation of these Terms, or your infringement of any
                  rights of a third party.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">12. Modifications to Terms or Service</h2>
                <p className="text-gray-700 mb-4">
                  Wallify may update these Terms at any time. We will notify users of material changes via email or
                  in-app notification. Continued use of the Service after changes constitutes acceptance of the revised
                  Terms.
                </p>
                <p className="text-gray-700">
                  We may modify, suspend, or discontinue the Service or any features thereof at any time without
                  liability to you.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">13. Governing Law and Jurisdiction</h2>
                <p className="text-gray-700">
                  These Terms shall be governed by and construed in accordance with the laws of the State of [Your
                  State], without regard to its conflict of laws principles. Any legal action or proceeding arising
                  under these Terms shall be brought exclusively in the courts located in [Your County, Your State], and
                  you consent to the jurisdiction of such courts.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">14. Miscellaneous</h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <span className="font-medium">Entire Agreement:</span> These Terms constitute the entire agreement
                    between you and Wallify regarding the Service.
                  </li>
                  <li>
                    <span className="font-medium">Severability:</span> If any provision is found invalid, the remaining
                    provisions remain in effect.
                  </li>
                  <li>
                    <span className="font-medium">Waiver:</span> Failure to enforce any right or provision does not
                    constitute a waiver of that right.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">15. Contact Information</h2>
                <p className="text-gray-700 mb-2">For questions about these Terms, please contact us:</p>
                <p className="text-gray-700 mb-1">
                  Email:{" "}
                  <a href="mailto:support@wallify.ai" className="text-primary hover:underline">
                    support@wallify.ai
                  </a>
                </p>
                <p className="text-gray-700">Mail: Wallify, LLC, [Business Address]</p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-12 bg-gray-50">
        <div className="centered-container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500">© 2025 WallScape.io. All rights reserved.</p>
          <div className="flex gap-8 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
