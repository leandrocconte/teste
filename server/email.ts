import nodemailer from 'nodemailer';

// This is a mock function for the email service
// In a production environment, you would use a real email service
export async function sendVerificationEmail(email: string, userId: number): Promise<void> {
  // For development purposes, we're just logging the verification link
  console.log(`[EMAIL SERVICE] Verification link: http://localhost:5000/api/verify-email/${userId}`);
  
  // In production, would be implemented with a real email service:
  /*
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verifique seu email - IA Chat',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bem-vindo ao IA Chat!</h2>
        <p>Obrigado por se cadastrar. Por favor, clique no link abaixo para verificar seu email:</p>
        <p>
          <a href="http://localhost:5000/api/verify-email/${userId}" 
             style="display: inline-block; background-color: #8B5CF6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verificar Email
          </a>
        </p>
        <p>Se você não solicitou este email, por favor ignore-o.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  */
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  // For development purposes
  console.log(`[EMAIL SERVICE] Password reset link: http://localhost:5000/reset-password?token=${token}`);
  
  // In production, would be implemented with a real email service
}
