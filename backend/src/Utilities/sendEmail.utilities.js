export const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "LocateMySpares",
          email: process.env.EMAIL_USER, // Make sure this exact email is verified in Brevo
        },
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      throw new Error("Failed to send email via Brevo API");
    }

    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    throw new Error("Could not send email");
  }
};
