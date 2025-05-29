import { Resend } from "resend"

// Initialize Resend with API key from environment variables
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Function to send contact form emails
export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name?: string
  email: string
  message: string
}) {
  if (!resend) {
    console.error("Resend API key is not configured")
    throw new Error("Email service is not configured")
  }

  try {
    // Create HTML email content directly instead of using React components
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Form Submission</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #f6f9fc;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
            }
            .content {
              padding: 20px;
              background-color: #ffffff;
            }
            .message-box {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 4px;
              margin-top: 10px;
              white-space: pre-wrap;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666666;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <p><strong>Name:</strong> ${name || "Not provided"}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <div class="message-box">${message}</div>
            </div>
            <div class="footer">
              <p>Sent from WallScape.io contact form</p>
            </div>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: "WallScape.io <onboarding@resend.dev>",
      to: ["silverstring@gmail.com"], // The recipient of contact form submissions
      subject: `New Contact Form Submission from ${name || email}`,
      reply_to: email,
      html: htmlContent,
    })

    if (error) {
      console.error("Error sending contact email:", error)
      throw new Error(error.message)
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending contact email:", error)
    throw error
  }
}

// Function to send newsletter confirmation emails
export async function sendNewsletterConfirmation({ email }: { email: string }) {
  if (!resend) {
    console.error("Resend API key is not configured")
    throw new Error("Email service is not configured")
  }

  try {
    // Create HTML email content directly
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to WallScape.io Newsletter</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #f6f9fc;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
            }
            .content {
              padding: 20px;
              background-color: #ffffff;
            }
            .button {
              display: inline-block;
              background-color: #4f46e5;
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 4px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666666;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to WallScape.io Newsletter</h1>
            </div>
            <div class="content">
              <p>Thank you for subscribing to our newsletter!</p>
              <p>You'll now receive updates about new features, wallpaper collections, and special offers.</p>
              <p>If you didn't subscribe to this newsletter, please ignore this email.</p>
              <a href="https://wallscape.io" class="button">Visit WallScape.io</a>
            </div>
            <div class="footer">
              <p>© 2023 WallScape.io. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: "WallScape.io <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to WallScape.io Newsletter",
      html: htmlContent,
    })

    if (error) {
      console.error("Error sending newsletter confirmation:", error)
      throw new Error(error.message)
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending newsletter confirmation:", error)
    throw error
  }
}
