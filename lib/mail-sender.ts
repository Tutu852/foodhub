import nodemailer from 'nodemailer'

export async function mailSender(email: string, title: string, body: string): Promise<any> {
  const host = process.env.MAIL_HOST
  const user = process.env.MAIL_USER
  const pass = process.env.MAIL_PASS

  // Always log the email details to the console/terminal for development visibility
  console.log('\n==================================================')
  console.log('📬 [MAIL SENDER LOG]')
  console.log(`To:      ${email}`)
  console.log(`Subject: ${title}`)
  console.log('--------------------------------------------------')
  console.log('Body:')
  // Remove HTML tags for clean console display
  console.log(body.replace(/<[^>]*>/g, ' ').trim().replace(/\s+/g, ' '))
  console.log('==================================================\n')

  // If credentials are not configured, treat the console log as the successful delivery
  if (!host || !user || !pass) {
    return { response: 'Console logger fallback success' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      auth: {
        user,
        pass,
      },
      secure: false,
    })

    const info = await transporter.sendMail({
      from: `"FoodHub" <${user}>`,
      to: email,
      subject: title,
      html: body,
    })

    console.log('Mail sent successfully. Response:', info.response)
    return info
  } catch (error: any) {
    console.error('Nodemailer error sending email:', error.message)
    throw error
  }
}
