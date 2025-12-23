interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const config = useRuntimeConfig();
  const apiKey = config.emailApiKey;

  // If no API key is configured, log to console (Dev/Mock mode)
  if (!apiKey) {
    // Simulate async delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log("---------------------------------------------------");
    console.log("📧 MOCK EMAIL SEND (No API Key configured)");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text}`);
    console.log("---------------------------------------------------");
    return { success: true, id: "mock-id" };
  }

  // Implementation for a real provider (e.g., Postmark)
  // This is a placeholder for where the fetch call would go
  try {
    // Example fetch to generic provider
    // const response = await $fetch('https://api.postmarkapp.com/email', {
    //   method: 'POST',
    //   headers: { 'X-Postmark-Server-Token': apiKey },
    //   body: { ... }
    // })
    console.log(`Real email send attempted to ${options.to}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
};
