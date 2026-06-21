import { NextRequest, NextResponse } from 'next/server'
import { mailSender } from '@/lib/mail-sender'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields (name, email, subject, message) are required.' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    // Send email notification to the site contact email
    const recipient = '852tutukumar@gmail.com'
    const emailSubject = `FoodHub Contact Form: ${subject}`
    const emailBody = `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #FF385C; text-align: center; border-bottom: 2px solid #FF385C; padding-bottom: 10px;">New Contact Inquiry</h2>
        <p>You have received a new message from the FoodHub contact form.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee; width: 100px;">Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Subject:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${subject}</td>
          </tr>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; border-left: 4px solid #FF385C;">
          <p style="margin: 0; font-weight: bold; color: #555;">Message:</p>
          <p style="margin: 10px 0 0 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        
        <p style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888; text-align: center;">
          This inquiry was sent from the FoodHub website contact form.
        </p>
      </div>
    `

    await mailSender(recipient, emailSubject, emailBody)

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you shortly.',
    })
  } catch (error: any) {
    console.error('Contact form submission error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
