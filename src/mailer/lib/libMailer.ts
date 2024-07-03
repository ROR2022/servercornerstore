import * as nodemailer from 'nodemailer';

const { USER_MAILER, PASS_MAILER } = process.env;

export const sendConfimCodeMailer = async (
  emailUser: string,
  confirmationCode: number,
) => {
  const confirmPage = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation Code Template</title>
    </head>
    <body>
        <h1>Welcome: ${emailUser}</h1>
        <p>Thank you for signing up with us. Please use the following code to confirm your email address:</p>
        <h2>${confirmationCode}</h2>
        <p>Thank you for choosing us!</p>
    </body>
    </html>`;

  const subjectMailOptions = `Tu Código de Acceso es: ${confirmationCode}`;
  const destinationMail = emailUser;
  try {
    const result = await sendEmail({
      confirmPage,
      subjectMailOptions,
      destinationMail,
    });

    return result;
  } catch (error) {
    console.log('error sendConfimCodeMailer:..', error);
  }
};

const sendEmail = async (dataMail: any) => {
  const { confirmPage, subjectMailOptions, destinationMail } = dataMail;
  let objRes = {};
  try {
    const transporter = nodemailer.createTransport({
      host: 'mail.gmx.com',
      port: 587,
      secure: false,
      auth: {
        user: USER_MAILER,
        pass: PASS_MAILER,
      },
    });

    const mailOptions = {
      from: USER_MAILER,
      to: destinationMail,
      subject: subjectMailOptions,
      html: confirmPage,
    };

    //aqui verificamos que el mailerService esta activo
    transporter.verify(function (error, success) {
      if (error) {
        console.log('No response from mail service:..', error);
      }
      if (success) {
        console.log('Server is ready to take our messages:..');
      }
    });

    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          objRes = {
            ...objRes,
            estatus: 'Error al enviar email',
            message: error,
          };
          console.log(objRes);
          resolve(objRes);
        } else {
          console.log('Email enviado: ' + info.response);
          //await addToLoggerNewUserFile(`Result del envio del Código..${result}`);
          objRes = {
            ...objRes,
            estatus: 'Email enviado',
            message: info.response,
          };
          console.log(objRes);
          resolve(objRes);
        }
      });
    });
  } catch (error) {
    console.log('error sendEmail:..', error);
  }
};
