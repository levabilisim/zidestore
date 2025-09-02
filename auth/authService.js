const emailService = require('./emailService');
const userService = require('./userService');

class AuthService {
    constructor() {
        // Pending registrations (email doğrulaması bekleyenler)
        this.pendingRegistrations = new Map();
        // Pending password resets (şifre sıfırlama bekleyenler)
        this.pendingPasswordResets = new Map();
    }

    // Kayıt işlemini başlat (e-posta doğrulama gönder)
    async startRegistration(userData) {
        try {
            const { email, username, password } = userData;

            // E-posta ve kullanıcı adı kontrolleri
            if (await userService.isEmailExists(email)) {
                return {
                    success: false,
                    message: 'Bu e-posta adresi zaten kullanılıyor'
                };
            }

            if (await userService.isUsernameExists(username)) {
                return {
                    success: false,
                    message: 'Bu kullanıcı adı zaten alınmış'
                };
            }

            // Pending registration'ı kaydet
            this.pendingRegistrations.set(email, {
                email,
                username,
                password,
                timestamp: Date.now()
            });

            // Doğrulama kodu gönder
            const emailResult = await emailService.sendVerificationCode(email);
            
            if (emailResult.success) {
                return {
                    success: true,
                    message: 'Doğrulama kodu e-posta adresinize gönderildi',
                    email: email,
                    expiresIn: emailResult.expiresIn
                };
            } else {
                this.pendingRegistrations.delete(email);
                return emailResult;
            }

        } catch (error) {
            console.error('Start registration error:', error);
            return {
                success: false,
                message: 'Kayıt işlemi başlatılırken hata oluştu'
            };
        }
    }

    // E-posta doğrulama ve kayıt tamamlama
    async completeRegistration(email, verificationCode) {
        try {
            // Doğrulama kodunu kontrol et
            const verifyResult = emailService.verifyCode(email, verificationCode);
            
            if (!verifyResult.success) {
                return verifyResult;
            }

            // Pending registration'ı kontrol et
            const pendingData = this.pendingRegistrations.get(email);
            
            if (!pendingData) {
                return {
                    success: false,
                    message: 'Kayıt verisi bulunamadı. Lütfen tekrar kayıt olmayı deneyin.'
                };
            }

            // Zaman aşımı kontrolü (30 dakika)
            if (Date.now() - pendingData.timestamp > 30 * 60 * 1000) {
                this.pendingRegistrations.delete(email);
                return {
                    success: false,
                    message: 'Kayıt süresi dolmuş. Lütfen tekrar kayıt olmayı deneyin.'
                };
            }

            // Kullanıcıyı oluştur
            const createResult = await userService.createUser({
                email: pendingData.email,
                username: pendingData.username,
                password: pendingData.password
            });

            // Pending registration'ı temizle
            this.pendingRegistrations.delete(email);

            return createResult;

        } catch (error) {
            console.error('Complete registration error:', error);
            return {
                success: false,
                message: 'Kayıt tamamlanırken hata oluştu'
            };
        }
    }

    // Doğrulama kodunu yeniden gönder
    async resendVerificationCode(email) {
        try {
            const pendingData = this.pendingRegistrations.get(email);
            
            if (!pendingData) {
                return {
                    success: false,
                    message: 'Bu e-posta için bekleyen kayıt bulunamadı'
                };
            }

            return await emailService.sendVerificationCode(email);

        } catch (error) {
            console.error('Resend verification error:', error);
            return {
                success: false,
                message: 'Kod yeniden gönderilirken hata oluştu'
            };
        }
    }

    // Kayıt işlemini iptal et
    cancelRegistration(email) {
        this.pendingRegistrations.delete(email);
        emailService.clearCode(email);
        return {
            success: true,
            message: 'Kayıt işlemi iptal edildi'
        };
    }

    // Kullanıcı girişi
    async login(emailOrUsername, password) {
        return await userService.loginUser(emailOrUsername, password);
    }

    // Kullanıcı bilgilerini getir
    async getUserInfo(userId) {
        return await userService.getUserById(userId);
    }

    // Şifre sıfırlama kodu gönder
    async sendPasswordResetCode(email) {
        try {
            // E-posta adresinin kayıtlı olup olmadığını kontrol et
            if (!await userService.isEmailExists(email)) {
                return {
                    success: false,
                    message: 'Bu e-posta adresi kayıtlı değil'
                };
            }

            // Pending reset'i kaydet
            this.pendingPasswordResets.set(email, {
                email,
                timestamp: Date.now()
            });

            // Şifre sıfırlama kodu gönder
            const emailResult = await emailService.sendPasswordResetCode(email);
            
            if (emailResult.success) {
                return {
                    success: true,
                    message: 'Şifre sıfırlama kodu e-posta adresinize gönderildi',
                    email: email,
                    expiresIn: emailResult.expiresIn
                };
            } else {
                this.pendingPasswordResets.delete(email);
                return emailResult;
            }

        } catch (error) {
            console.error('Password reset send error:', error);
            return {
                success: false,
                message: 'Kod gönderilirken hata oluştu'
            };
        }
    }

    // Şifre sıfırlama kodunu doğrula
    async verifyPasswordResetCode(email, code) {
        try {
            // Pending reset kontrolü
            if (!this.pendingPasswordResets.has(email)) {
                return {
                    success: false,
                    message: 'Geçersiz işlem'
                };
            }

            // Kodu doğrula
            const verifyResult = await emailService.verifyPasswordResetCode(email, code);
            
            if (verifyResult.success) {
                return {
                    success: true,
                    message: 'Kod doğrulandı'
                };
            } else {
                return verifyResult;
            }

        } catch (error) {
            console.error('Password reset verify error:', error);
            return {
                success: false,
                message: 'Kod doğrulama sırasında hata oluştu'
            };
        }
    }

    // Şifreyi sıfırla
    async resetPassword(email, newPassword) {
        try {
            // Pending reset kontrolü
            if (!this.pendingPasswordResets.has(email)) {
                return {
                    success: false,
                    message: 'Geçersiz işlem'
                };
            }

            // Şifreyi güncelle
            const resetResult = await userService.updatePassword(email, newPassword);
            
            if (resetResult.success) {
                // Pending reset'i temizle
                this.pendingPasswordResets.delete(email);
                
                // Email verification kodlarını da temizle
                emailService.clearPasswordResetCode(email);
                
                return {
                    success: true,
                    message: 'Şifre başarıyla değiştirildi'
                };
            } else {
                return resetResult;
            }

        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                message: 'Şifre değiştirme sırasında hata oluştu'
            };
        }
    }

    // Şifre sıfırlama işlemini iptal et
    cancelPasswordReset(email) {
        this.pendingPasswordResets.delete(email);
        emailService.clearPasswordResetCode(email);
        
        return {
            success: true,
            message: 'Şifre sıfırlama işlemi iptal edildi'
        };
    }
}

module.exports = new AuthService();
