import Mailgen from 'mailgen';
import mailgen from 'mailgen';
import nodeMailer from 'nodemailer';

const sendEmail = async (options) => {
    const maileGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Project Camp',
            link: 'https://project-camp.vercel.app',
        },
    });

    const emailTectual = maileGenerator.generatePlaintext(
        options.mailgenContent,
    );

    const emailHtml = maileGenerator.generate(options.mailgenContent);

    const transporter = nodeMailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });

    const mail = {
        from: 'Project Camp <b6H0o@example.com>',
        to: options.email,
        subject: options.subject,
        text: emailTectual,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const emailVefification = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to Project Camp! We're very excited to have you on board.",
            action: {
                intstructions:
                    'To get started with Project Camp, please click here:',
                button: {
                    color: '#22BC66',
                    text: 'Confirm your email',
                    link: verificationUrl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};

const forgotPasswordMailgen = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: 'To reset your password, click the button below:',
            action: {
                intstructions:
                    'To get started with Project Camp, please click here:',
                button: {
                    color: '#d21107ff',
                    text: 'Reset your password',
                    link: passwordResetUrl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};

export { emailVefification, forgotPasswordMailgen, sendEmail };
