const Customer = require("../models/Contact");
const sendEmail = require("../utils/mail-sender");

const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const contact = new Customer({ name, email, subject, message });
    await contact.save();

    // ✅ 1. Send email to ADMIN
    await sendEmail(
      process.env.EMAIL_USER,
      "New Contact Form Submission",
      `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: #ff4d4d; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">📩 New Contact Message</h1>
        <p style="margin: 5px 0 0;">Digital Indian</p>
      </div>

      <!-- Body -->
      <div style="padding: 20px;">
        
        <p style="font-size: 16px; color: #333;">
          You have received a new message from your website contact form:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 10px; font-weight: bold; background: #f9f9f9;">Name</td>
            <td style="padding: 10px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; background: #f9f9f9;">Email</td>
            <td style="padding: 10px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; background: #f9f9f9;">Subject</td>
            <td style="padding: 10px;">${subject}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; background: #f9f9f9;">Message</td>
            <td style="padding: 10px;">${message}</td>
          </tr>
        </table>

        <!-- Button -->
        <div style="text-align: center; margin-top: 25px;">
          <a href="mailto:${email}" 
             style="background: #ff4d4d; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
             Reply to Customer
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Digital Indian. All rights reserved.
      </div>

    </div>

  </div>
  `,
    );

    // ✅ 2. Send confirmation email to USER
    await sendEmail(
      email,
      "Thank You for Contacting Us",
      `
      <h2>Hello ${name},</h2>
      <p>Thank you for reaching out to us 🙏</p>
      <p>We have received your message and will get back to you shortly.</p>
      <hr/>
      <p><b>Your Message:</b></p>
      <p>${message}</p>
      <br/>
      <p>Regards,<br/>Digital Indian Team</p>
      `,
    );

    res.json({ msg: "Message submitted & email sent", contact });
  } catch (err) {
    res.status(500).json({ msg: "error", error: err.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await Customer.find();
    res.json({ contacts });
  } catch (err) {
    res.status(500).json({ msg: "error", error: err.message });
  }
};

module.exports = { submitContactForm, getContacts };
