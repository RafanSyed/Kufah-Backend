import { transporter } from "./transporter";

export const sendAttendanceEmail = async (
  studentEmail: string,
  studentName: string,
  token: string
) => {
  const today = new Date();
  const attendanceLink = `${process.env.FRONTEND_URL}/pages/attendance?token=${token}`;

  const mailOptions = {
    from: `"Kufah" <${process.env.SMTP_USER}>`,
    to: studentEmail,
    subject: `Mark your attendance for ${today.toLocaleDateString()}`,
    html: `<p>As-salamu alaykum ${studentName},</p>
           <p>Please mark your attendance for your classes for today by clicking the link below:</p>
           <a href="${attendanceLink}">${attendanceLink}</a>
           <p>JazakAllahu Khairan,<br/>Kufah Team</p>`,
  };

  await transporter.sendMail(mailOptions);
};
