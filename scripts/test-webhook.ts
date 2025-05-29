/**
 * This script sends a test webhook event to the local webhook endpoint
 * Run with: npx tsx scripts/test-webhook.ts
 */

async function main() {
  try {
    console.log("Sending test webhook event to local endpoint...")

    // Create a simple test event
    const testEvent = {
      id: "evt_test_" + Date.now(),
      object: "event",
      api_version: "2022-11-15",
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: "cs_test_" + Date.now(),
          object: "checkout.session",
          metadata: {
            userId: "test-user-123",
            planName: "starter",
            priceId: "price_test_123",
          },
          customer: "cus_test_123",
          subscription: "sub_test_123",
        },
      },
      type: "checkout.session.completed",
      livemode: false,
    }

    // Send the test event to the webhook endpoint
    const response = await fetch("http://localhost:3000/api/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "test_signature",
      },
      body: JSON.stringify(testEvent),
    })

    const responseData = await response.json()
    console.log("Response status:", response.status)
    console.log("Response data:", responseData)

    if (response.ok) {
      console.log("Test webhook event sent successfully!")
    } else {
      console.error("Failed to send test webhook event")
    }
  } catch (error) {
    console.error("Error sending test webhook event:", error)
  }
}

main()
