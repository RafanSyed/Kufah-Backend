import nodemailer from "nodemailer";

export const sendAttendanceEmail = async (
  studentEmail: string,
  studentName: string,
  token: string
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const attendanceLink = `${process.env.FRONTEND_URL}/pages/attendance?token=${token}`;

  const mailOptions = {
    from: `"Kufah" <${process.env.SMTP_USER}>`,
    to: studentEmail,
    subject: "Mark your attendance",
    html: `<p>Assalamualaikum ${studentName},</p>
           <p>Please mark your attendance for your classes by clicking the link below:</p>
           <a href="${attendanceLink}">${attendanceLink}</a>
           <p>This link expires in 24 hours.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
