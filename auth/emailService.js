const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
    constructor() {
        // Gmail SMTP configuration (test için)
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'levabilisim@gmail.com', // Test email (gerçek projede environment variable kullanın)
                pass: 'kcua gcld sqsm ouoj'    // App password (gerçek projede environment variable kullanın)
            }
        });
        
        // Verification codes storage (gerçek projede database kullanın)
        this.verificationCodes = new Map();
        // Password reset codes storage
        this.passwordResetCodes = new Map();
    }

    // 6 haneli doğrulama kodu oluştur
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Doğrulama kodu gönder
    async sendVerificationCode(email) {
        try {
            const code = this.generateVerificationCode();
            const expiresAt = Date.now() + 10 * 60 * 1000; // 10 dakika geçerli
            
            // Kodu kaydet
            this.verificationCodes.set(email, {
                code: code,
                expiresAt: expiresAt,
                attempts: 0
            });

            // E-posta şablonu
            const mailOptions = {
                from: '"Zide Store" <zidestore@gmail.com>',
                to: email,
                subject: 'Zide Store - E-posta Doğrulama Kodu',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #8a2be2; margin: 0;">Zide Store</h1>
                            <p style="color: #666; margin: 5px 0;">Modern E-ticaret Platformu</p>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #8a2be2, #6a1b9a); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                            <h2 style="color: white; margin: 0 0 10px 0;">E-posta Doğrulama</h2>
                            <p style="color: rgba(255,255,255,0.9); margin: 0 0 20px 0;">Hesabınızı oluşturmak için aşağıdaki kodu kullanın:</p>
                            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; display: inline-block;">
                                <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing: 5px;">${code}</h1>
                            </div>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="color: #333; margin: 0 0 10px 0;">⚠️ Güvenlik Bilgileri:</h3>
                            <ul style="color: #666; margin: 0; padding-left: 20px;">
                                <li>Bu kod 10 dakika boyunca geçerlidir</li>
                                <li>Kodu kimseyle paylaşmayın</li>
                                <li>Bu e-postayı siz talep etmediyseniz güvenle silebilirsiniz</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; color: #999; font-size: 12px;">
                            <p>Bu e-posta Zide Store tarafından otomatik olarak gönderilmiştir.</p>
                            <p>© 2025 Zide Store. Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                `
            };

            // Geliştirme modunda konsola yazdır
            console.log(`📧 Verification code for ${email}: ${code}`);
            
            // Gerçek e-posta gönderme
            await this.transporter.sendMail(mailOptions);
            
            return {
                success: true,
                message: 'Doğrulama kodu gönderildi',
                expiresIn: 600 // 10 dakika
            };
            
        } catch (error) {
            console.error('Email send error:', error);
            return {
                success: false,
                message: 'E-posta gönderilemedi',
                error: error.message
            };
        }
    }

    // Doğrulama kodunu kontrol et
    verifyCode(email, inputCode) {
        const stored = this.verificationCodes.get(email);
        
        if (!stored) {
            return {
                success: false,
                message: 'Doğrulama kodu bulunamadı. Yeni kod talep edin.'
            };
        }

        // Süre kontrolü
        if (Date.now() > stored.expiresAt) {
            this.verificationCodes.delete(email);
            return {
                success: false,
                message: 'Doğrulama kodu süresi dolmuş. Yeni kod talep edin.'
            };
        }

        // Deneme sayısı kontrolü
        if (stored.attempts >= 3) {
            this.verificationCodes.delete(email);
            return {
                success: false,
                message: 'Çok fazla yanlış deneme. Yeni kod talep edin.'
            };
        }

        // Kod kontrolü
        if (stored.code !== inputCode.toString()) {
            stored.attempts++;
            return {
                success: false,
                message: `Yanlış kod. ${3 - stored.attempts} deneme hakkınız kaldı.`
            };
        }

        // Başarılı doğrulama
        this.verificationCodes.delete(email);
        return {
            success: true,
            message: 'E-posta başarıyla doğrulandı'
        };
    }

    // Kodu sil (iptal durumunda)
    clearCode(email) {
        this.verificationCodes.delete(email);
    }

    // Şifre sıfırlama kodu gönder
    async sendPasswordResetCode(email) {
        try {
            const code = this.generateVerificationCode();
            const expiresAt = Date.now() + 10 * 60 * 1000; // 10 dakika geçerli
            
            // Kodu kaydet
            this.passwordResetCodes.set(email, {
                code,
                expiresAt,
                attempts: 0
            });

            const mailOptions = {
                from: 'levabilisim@gmail.com',
                to: email,
                subject: 'Zide Store - Şifre Sıfırlama',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; border-radius: 15px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #8a2be2, #9f4bdb); padding: 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px;">🔐 Şifre Sıfırlama</h1>
                        </div>
                        
                        <div style="padding: 30px;">
                            <h2 style="color: #8a2be2; margin-top: 0;">Şifre Sıfırlama Talebiniz</h2>
                            
                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                Merhaba,<br><br>
                                Zide Store hesabınız için şifre sıfırlama talebinde bulundunuz. 
                                Aşağıdaki 6 haneli kodu kullanarak şifrenizi sıfırlayabilirsiniz:
                            </p>
                            
                            <div style="background: rgba(138, 43, 226, 0.1); border: 2px solid #8a2be2; border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;">
                                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8a2be2; font-family: monospace;">
                                    ${code}
                                </div>
                            </div>
                            
                            <div style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                                <h4 style="margin: 0 0 10px 0; color: #ffc107;">⚠️ Güvenlik Uyarısı</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #b3b3b3;">
                                    <li>Bu kodu kimseyle paylaşmayın</li>
                                    <li>Şifre sıfırlama talebinde bulunmadıysanız bu e-postayı görmezden gelin</li>
                                    <li>Bu kod 10 dakika boyunca geçerlidir</li>
                                    <li>Şüpheli bir durum varsa hesabınızı kontrol edin</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div style="text-align: center; color: #999; font-size: 12px; padding: 20px;">
                            <p>Bu e-posta Zide Store tarafından otomatik olarak gönderilmiştir.</p>
                            <p>© 2025 Zide Store. Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                `
            };

            // Geliştirme modunda konsola yazdır
            console.log(`🔐 Password reset code for ${email}: ${code}`);
            
            // Gerçek e-posta gönderme
            await this.transporter.sendMail(mailOptions);
            
            return {
                success: true,
                expiresIn: 600 // 10 dakika
            };

        } catch (error) {
            console.error('Password reset email error:', error);
            return {
                success: false,
                message: 'E-posta gönderilirken hata oluştu'
            };
        }
    }

    // Şifre sıfırlama kodunu doğrula
    verifyPasswordResetCode(email, inputCode) {
        const stored = this.passwordResetCodes.get(email);
        
        if (!stored) {
            return {
                success: false,
                message: 'Doğrulama kodu bulunamadı. Yeni kod talep edin.'
            };
        }

        // Süre kontrolü
        if (Date.now() > stored.expiresAt) {
            this.passwordResetCodes.delete(email);
            return {
                success: false,
                message: 'Doğrulama kodu süresi doldu. Yeni kod talep edin.'
            };
        }

        // Deneme sayısı kontrolü
        if (stored.attempts >= 3) {
            this.passwordResetCodes.delete(email);
            return {
                success: false,
                message: 'Çok fazla yanlış deneme. Yeni kod talep edin.'
            };
        }

        // Kod kontrolü
        if (stored.code !== inputCode.toString()) {
            stored.attempts++;
            return {
                success: false,
                message: `Yanlış kod. ${3 - stored.attempts} deneme hakkınız kaldı.`
            };
        }

        // Başarılı doğrulama - kodu silme, çünkü şifre değiştirilene kadar geçerli olmalı
        return {
            success: true,
            message: 'Kod başarıyla doğrulandı'
        };
    }

    // Şifre sıfırlama kodunu sil
    clearPasswordResetCode(email) {
        this.passwordResetCodes.delete(email);
    }
}

module.exports = new EmailService();
