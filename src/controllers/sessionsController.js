import { config } from "../config/config.js";
import { transporter } from "../config/gmail.js";
import { emailTemplate } from "../config/gmail.js";
import { twilioClient } from "../config/twilio.js";
import { logger } from "../helpers/logger.js";
export class SessionsController {
    
    static logout = (req,res) => {
        try {
            req.session.destroy(err=>{
                if(err) return res.render("profileView",{error:"No se pudo cerrar la sesion"});
                res.redirect("/");
            })
        } catch (error) {
            res.render("signupView",{error:"No se pudo registrar el usuario"});
        }
    }

    static sendMail = async (req,res) => {
        try {
            const result = await transporter.sendMail({
                from:config.gmail.account,
                to:"(Mail a enviar)",
                subject:"Tu registro ha sido exitoso",
                html: emailTemplate("Proyecto"),
            });
            logger.info(result);
            res.json({status:"success", message:"correo enviado"});
        } catch (error) {
            logger.error(error);
            res.json({status:"error", message:"Hubo un error al enviar el correo"})
        }
    }

    static sendSMS = async (req,res) => {
        try {
            const result = await twilioClient.messages.create({
                from:config.twilio.phone,
                to: "Numero a enviar",
                body:"Su pedido fue realizado correctamente"
            });
            logger.info(result);
            res.json({status:"success", message:"Envio de mensaje exitoso"});
        } catch (error) {
            logger.error(error);
            res.json({status:"error", message:"Hubo un error al enviar el mensaje de texto"})
        }
    }

    static forgotPassword = async(req,res)=>{
        const {email} = req.body;
        console.log(email);
        try {
            //Veificar que el usuario exista
            const user  = await UsersService.getUserByEmail(email);
            // console.log(user);
            const emailToken = generateEmailToken(email, 10 * 60)//5min
            await sendChangePasswordEmail(req,email,emailToken);
            res.send(`Se envio un enlace a su correo, <a href="/">Volver a la pagina de login</a>`);
        } catch (error) {
            res.json({status:"error", message:error.message});
        }
    };

    static resetPassword = async(req,res)=>{
        try {
            const token = req.query.token;
            const {newPassword} = req.body;
            const validEmail = verifyEmailToken(token);
            if(!validEmail){
                return res.send(`El enlace ya no es valido, genera un nuevo <a href="/forgot-password">enlace</a>`);
            }
            const user = await UsersService.getUserByEmail(validEmail);
            console.log("user", user);
            if(!user){
                return res.send(`Esta operacion no es valida`);
            }
            if(inValidPassword(newPassword,user)){
                return res.render("resetPassView", {error:"contraseña invalida", token});
            }
            const userData = {
                ...user,
                password: createHash(newPassword)
            };
            // console.log("userData", userData);
            await UsersService.updateUser(user._id, userData);
            res.render("login",{message:"Contraseña actualizada"});
        } catch (error) {
            res.json({status:"error", message:error.message});
        }
    };
}