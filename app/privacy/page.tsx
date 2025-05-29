"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
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
              <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-6 text-black">Privacy Policy</h1>
              <p className="text-gray-500 mb-8">Effective Date: March 21, 2025</p>

              <p className="text-gray-700 mb-8">
                WallScape.io, LLC ("WallScape.io," "we," "us," or "our") values your privacy and is committed to
                protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you access or use our website, applications, services, and advanced
                technology-powered image generation tools ("Services").
              </p>

              <p className="text-gray-700 mb-8">
                By using the Services, you agree to the terms of this Privacy Policy. If you do not agree, please do not
                use our Services.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">1. Information We Collect</h2>
                <p className="text-gray-700 mb-4">
                  We collect personal and usage information necessary to operate our Services, enhance user experience,
                  and comply with legal obligations. The types of information we collect include:
                </p>

                <div className="mb-4">
                  <h3 className="font-medium text-black mb-2">a. Account Information</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Email address</li>
                    <li>Authentication provider details (e.g., Google OAuth token)</li>
                    <li>Password (hashed and encrypted, if applicable)</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-black mb-2">b. Usage Data</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Text prompts submitted for image generation</li>
                    <li>Reference images uploaded by users</li>
                    <li>Generated images and download history</li>
                    <li>Subscription tier and generation count</li>
                    <li>IP address, browser type, device information</li>
                    <li>Log data and user preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-black mb-2">c. Payment Information</h3>
                  <p className="text-gray-700">
                    Payment data is securely processed via Stripe, Inc. Wallify does not collect or store full credit
                    card numbers or billing details. We receive confirmation of successful payment and subscription
                    status from Stripe.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">2. How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">We use the information we collect for the following purposes:</p>

                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>To provide, operate, and maintain our Services</li>
                  <li>To process payments and manage subscriptions</li>
                  <li>To personalize your experience and deliver relevant content</li>
                  <li>To communicate with you about your account, billing, and support inquiries</li>
                  <li>To monitor and analyze usage and trends to improve our Services</li>
                  <li>To enforce our Terms of Service and protect Wallify from fraud, abuse, or legal claims</li>
                  <li>To comply with applicable laws, regulations, or legal processes</li>
                </ul>

                <p className="text-gray-700">
                  We may use anonymized prompts and outputs to train and improve our technology models. These data are
                  stripped of identifiers and aggregated for internal analysis only.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">3. Data Sharing and Disclosure</h2>
                <p className="text-gray-700 mb-4">
                  Wallify does not sell or rent your personal information to third parties for marketing purposes.
                </p>

                <p className="text-gray-700 mb-4">
                  We may disclose your information in the following limited circumstances:
                </p>

                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <span className="font-medium">Service Providers:</span> We share information with third-party
                    vendors (e.g., Stripe, Supabase, OpenAI) solely to provide and support our Services. These vendors
                    are contractually obligated to safeguard your data.
                  </li>
                  <li>
                    <span className="font-medium">Legal Compliance:</span> We may disclose information if required by
                    law, legal process, or to protect the rights, property, or safety of Wallify, its users, or the
                    public.
                  </li>
                  <li>
                    <span className="font-medium">Business Transfers:</span> In the event of a merger, acquisition, or
                    asset sale, your information may be transferred. You will be notified via email and/or a prominent
                    notice on our website.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">4. Data Storage and Retention</h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    User data, including account information and generated content, is securely stored using Supabase,
                    which implements role-based access controls (RLS) to restrict data access.
                  </li>
                  <li>
                    Uploaded reference images are stored temporarily for processing and deleted within 30 days unless
                    otherwise required for subscription features or legal compliance.
                  </li>
                  <li>
                    We retain user information only for as long as necessary to fulfill the purposes outlined in this
                    Policy or as required by law.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">5. Security Measures</h2>
                <p className="text-gray-700 mb-4">
                  We take appropriate technical and organizational measures to protect your personal data, including:
                </p>

                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Secure data encryption in transit (TLS) and at rest</li>
                  <li>Regular security audits and access control reviews</li>
                  <li>Strict role-based access to production systems</li>
                  <li>Payment data handled exclusively by PCI-DSS compliant Stripe</li>
                </ul>

                <p className="text-gray-700">
                  However, no method of transmission or storage is 100% secure. You use the Service at your own risk and
                  are responsible for maintaining the confidentiality of your login credentials.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">6. Your Rights and Choices</h2>
                <p className="text-gray-700 mb-4">
                  Depending on your jurisdiction, you may have the following rights regarding your personal information:
                </p>

                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>
                    <span className="font-medium">Access:</span> Request access to the personal data we hold about you.
                  </li>
                  <li>
                    <span className="font-medium">Correction:</span> Request corrections or updates to your information.
                  </li>
                  <li>
                    <span className="font-medium">Deletion:</span> Request deletion of your account and associated data.
                  </li>
                  <li>
                    <span className="font-medium">Portability:</span> Request a copy of your data in a structured,
                    commonly used format.
                  </li>
                  <li>
                    <span className="font-medium">Withdrawal of Consent:</span> Where processing is based on consent,
                    you may withdraw it at any time.
                  </li>
                </ul>

                <p className="text-gray-700">
                  To exercise any of these rights, please contact us at support@wallify.ai. We may need to verify your
                  identity before processing such requests.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">7. International Data Transfers</h2>
                <p className="text-gray-700 mb-4">
                  Wallify is based in the United States. If you access the Service from outside the U.S., you understand
                  that your data may be transferred to, stored, and processed in the U.S. or other jurisdictions with
                  different data protection laws.
                </p>

                <p className="text-gray-700">
                  We comply with applicable data transfer laws, including the EU-U.S. Data Privacy Framework (if
                  applicable), and rely on standard contractual clauses or other lawful mechanisms for cross-border
                  transfers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">8. Children's Privacy</h2>
                <p className="text-gray-700">
                  Our Services are not intended for individuals under the age of 13. We do not knowingly collect
                  personal information from children. If we learn we have collected such data, we will delete it
                  promptly.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">9. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable
                  laws. Material changes will be communicated via email or in-app notification. The updated policy will
                  be effective as of the date posted.
                </p>

                <p className="text-gray-700">
                  Your continued use of the Service after the effective date of any update constitutes your acceptance
                  of the revised Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4 text-black">10. Contact Us</h2>
                <p className="text-gray-700 mb-2">
                  For questions or concerns about this Privacy Policy or your personal information, please contact:
                </p>
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
