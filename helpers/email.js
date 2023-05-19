import nodemailer from 'nodemailer';

const emailRegister = async (data) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // User info from UserController, register()
      const { name, email, token } = data;

      //Send email
      await transport.sendMail({
        from: 'RealState',
        to: email,
        subject: 'Account confirmation',
        text: 'Confirm your registration in RealState.',
        html: `
            <p>Hi ${name}. Please confirm your account in RealState.</p>

            <p>Congratulations! Your account registration was successful. To confirm your account, just click on the following link: <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirm/${token}">Confirm Account</a></p>

            <p>If you did not create this account, you can simply ignore this message.</p>
        `
      });
} 

const emailForgotPassword = async (data) => {
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // User info from UserController, register()
    const { name, email, token } = data;

    //Send email
    await transport.sendMail({
      from: 'RealState',
      to: email,
      subject: 'Restore your password in RealEstate',
      text: 'Restore your password in RealEstate.',
      html: `
          <p>Hi ${name}. You have requested to reset your password in RealEstate.</p>

          <p>Click on the following link to generate a new password: <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/forgot-password/${token}">Reset Password</a></p>

          <p>If you did not request to change your password, you can simply ignore this message.</p>
      `
    });
} 

export {
    emailRegister,
    emailForgotPassword,
}