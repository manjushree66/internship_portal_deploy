const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendFacultyCredentials = async ({
    email,
    name,
    temporaryPassword
}) => {

    await transporter.sendMail({
        from: `"PES Internship Portal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "PES Internship Portal - Faculty Login Credentials",

        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Welcome to the PES Internship Portal</h2>

                <p>Hello ${name},</p>

                <p>
                    Your faculty account has been created for the
                    Internship Management Portal.
                </p>

                <p><strong>Login credentials:</strong></p>

                <p>
                    <strong>Email:</strong> ${email}<br>
                    <strong>Temporary Password:</strong> ${temporaryPassword}
                </p>

                <p>
                    Please use these credentials to log in and change
                    your password after your first login.
                </p>

                <p>
                    Regards,<br>
                    PES Internship Portal
                </p>
            </div>
        `
    });
};