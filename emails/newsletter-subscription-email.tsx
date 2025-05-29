import { Body, Container, Head, Heading, Html, Preview, Section, Text, Button } from "@react-email/components"

interface NewsletterSubscriptionEmailProps {
  email: string
}

export default function NewsletterSubscriptionEmail({ email }: NewsletterSubscriptionEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to WallScape.io Newsletter</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to WallScape.io Newsletter</Heading>
          <Section style={section}>
            <Text style={text}>
              Thank you for subscribing to our newsletter! You'll now receive updates about new wallpapers, features,
              and special offers.
            </Text>
            <Text style={text}>Your email: {email}</Text>
            <Button href="https://wallscape.io" style={button}>
              Visit WallScape.io
            </Button>
            <Text style={footerText}>
              If you didn't subscribe to this newsletter, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px",
  borderRadius: "5px",
  maxWidth: "600px",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  padding: "0",
  textAlign: "center" as const,
}

const section = {
  padding: "20px",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
}

const button = {
  backgroundColor: "#5c6bc0",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 16px",
  margin: "26px 0",
}

const footerText = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "16px 0",
}
