import mailgen from 'mailgen';

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
