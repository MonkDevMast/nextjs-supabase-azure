import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

interface SubscriptionConfirmationEmailProps {
  userName: string
  planName: string
  billingDate: string
  amount: string
  dashboardUrl: string
}

export const SubscriptionConfirmationEmail = ({
  userName = "John Doe",
  planName = "Pro",
  billingDate = "April 15, 2025",
  amount = "$9.99",
  dashboardUrl = "https://wallscape.io/dashboard",
}: SubscriptionConfirmationEmailProps) => {
  const previewText = `Your ${planName} subscription is active!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src="https://wallscape.io/logo.png" width="48" height="48" alt="WallScape.io" style={logo} />
          <Heading style={heading}>Subscription Confirmed</Heading>
          <Section style={section}>
            <Text style={text}>Hi {userName},</Text>
            <Text style={text}>Thank you for subscribing to WallScape.io! Your {planName} plan is now active.</Text>
            <Text style={text}>
              <strong>Plan:</strong> {planName}
              <br />
              <strong>Amount:</strong> {amount} per month
              <br />
              <strong>Next billing date:</strong> {billingDate}
            </Text>
            <Text style={text}>
              You now have access to all the features included in your plan. Start creating amazing wallpapers today!
            </Text>
            <Link href={dashboardUrl} style={button}>
              Go to Dashboard
            </Link>
            <Text style={text}>
              If you have any questions or need assistance, please don't hesitate to contact our support team.
            </Text>
            <Text style={text}>
              Best regards,
              <br />
              The WallScape.io Team
            </Text>
          </Section>
          <Text style={footer}>
            © 2025 WallScape.io. All rights reserved.
            <br />
            <Link href="https://wallscape.io/privacy" style={link}>
              Privacy Policy
            </Link>{" "}
            •
            <Link href="https://wallscape.io/terms" style={link}>
              Terms of Service
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
}

const logo = {
  margin: "0 auto 20px",
  display: "block",
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  color: "#3b82f6",
}

const section = {
  backgroundColor: "#111111",
  padding: "30px",
  borderRadius: "10px",
  marginBottom: "30px",
  border: "1px solid #333333",
}

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  marginBottom: "20px",
}

const button = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "50px",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  marginTop: "30px",
  marginBottom: "30px",
  fontWeight: "bold",
}

const footer = {
  textAlign: "center" as const,
  fontSize: "14px",
  color: "#666666",
  marginTop: "30px",
}

const link = {
  color: "#3b82f6",
  textDecoration: "none",
  margin: "0 5px",
}

export default SubscriptionConfirmationEmail
