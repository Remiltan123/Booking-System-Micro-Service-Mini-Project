export const forgotPasswordTemplate = (resetLink) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password.</p>
      
      <a href="${resetLink}" 
         style="background:#4CAF50;color:white;padding:10px 15px;
         text-decoration:none;border-radius:5px;">
         Reset Password
      </a>

      <p>This link will expire in 15 minutes.</p>
    </div>
  `;
};