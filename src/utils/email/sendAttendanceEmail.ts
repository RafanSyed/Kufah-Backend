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


export const sendFiqhMigrationEmail = async (
  studentEmail: string,
  studentName: string,
  token: string
) => {
  const migrationLink = `${process.env.FRONTEND_URL}/pages/migrate-fiqh?token=${token}`;

  const mailOptions = {
    from: `"Kufah" <${process.env.SMTP_USER}>`,
    to: studentEmail,
    subject: `Fiqh Class Update – Action Required`,
    html: `
      <p>As-salamu alaykum ${studentName},</p>

      <p>
        Due to a schedule change, the Sisters Fiqh class will now be held on <b>Saturday at 11am</b>.
      </p>

      <p>
        If you are a sister attending the Fiqh class, please confirm your move to the new class by clicking below:
      </p>

      <a href="${migrationLink}">Confirm Class Change</a>

      <p>
        If this does not apply to you, you may safely ignore this email.
      </p>

      <p>JazakAllahu Khairan,<br/>Kufah Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendTajweedMigrationEmail = async (
  studentEmail: string,
  studentName: string,
  token: string
) => {
  const migrationLink = `${process.env.FRONTEND_URL}/pages/migrate-tajweed?token=${token}`;

  const mailOptions = {
    from: `"Kufah" <${process.env.SMTP_USER}>`,
    to: studentEmail,
    subject: `Tajweed Class Update – Action Required`,
    html: `
      <p>As-salamu alaykum ${studentName},</p>

      <p>
        If you are receiving this email, it means you are currently enrolled in the Tajweed class.
      </p>

      <p>
        If you are a sister attending Tajweed, the class timing will now change to:
      </p>

      <p>
        <b>Tuesday & Thursday at 7:00 PM (replacing Fiqh)</b>
      </p>

      <p>
        Please confirm your move by clicking the link below:
      </p>

      <a href="${migrationLink}">Confirm Class Change</a>

      <p>
        If this does not apply to you, you may safely ignore this email.
      </p>

      <p>JazakAllahu Khairan,<br/>Kufah Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};