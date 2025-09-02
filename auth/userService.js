const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class UserService {
    constructor() {
        this.userDataPath = path.join(__dirname, '..', 'data', 'users.json');
        this.ensureDataDirectory();
    }

    // Data klasörünü oluştur
    async ensureDataDirectory() {
        const dataDir = path.dirname(this.userDataPath);
        await fs.ensureDir(dataDir);
        
        // Users dosyası yoksa oluştur
        if (!await fs.pathExists(this.userDataPath)) {
            await fs.writeJson(this.userDataPath, [], { spaces: 2 });
        }
    }

    // Tüm kullanıcıları getir
    async getUsers() {
        try {
            return await fs.readJson(this.userDataPath);
        } catch (error) {
            console.error('Users read error:', error);
            return [];
        }
    }

    // Kullanıcıları kaydet
    async saveUsers(users) {
        try {
            await fs.writeJson(this.userDataPath, users, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Users save error:', error);
            return false;
        }
    }

    // Şifre hash'le
    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    // E-posta kontrol et
    async isEmailExists(email) {
        const users = await this.getUsers();
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // Kullanıcı adı kontrol et
    async isUsernameExists(username) {
        const users = await this.getUsers();
        return users.some(user => user.username.toLowerCase() === username.toLowerCase());
    }

    // Yeni kullanıcı oluştur
    async createUser(userData) {
        try {
            const { email, username, password } = userData;
            
            // E-posta kontrolü
            if (await this.isEmailExists(email)) {
                return {
                    success: false,
                    message: 'Bu e-posta adresi zaten kullanılıyor'
                };
            }

            // Kullanıcı adı kontrolü
            if (await this.isUsernameExists(username)) {
                return {
                    success: false,
                    message: 'Bu kullanıcı adı zaten alınmış'
                };
            }

            const users = await this.getUsers();
            
            // Yeni kullanıcı objesi
            const newUser = {
                id: Date.now().toString(),
                email: email.toLowerCase(),
                username: username,
                password: this.hashPassword(password),
                createdAt: new Date().toISOString(),
                isActive: true,
                profile: {
                    displayName: username,
                    joinDate: new Date().toISOString()
                }
            };

            users.push(newUser);
            
            if (await this.saveUsers(users)) {
                return {
                    success: true,
                    message: 'Hesap başarıyla oluşturuldu',
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        username: newUser.username,
                        displayName: newUser.profile.displayName
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Hesap oluşturulurken hata oluştu'
                };
            }

        } catch (error) {
            console.error('Create user error:', error);
            return {
                success: false,
                message: 'Sistem hatası oluştu'
            };
        }
    }

    // Kullanıcı girişi
    async loginUser(emailOrUsername, password) {
        try {
            const users = await this.getUsers();
            const hashedPassword = this.hashPassword(password);
            
            const user = users.find(u => 
                (u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
                 u.username.toLowerCase() === emailOrUsername.toLowerCase()) &&
                u.password === hashedPassword &&
                u.isActive
            );

            if (user) {
                return {
                    success: true,
                    message: 'Giriş başarılı',
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        displayName: user.profile.displayName
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'E-posta/kullanıcı adı veya şifre hatalı'
                };
            }

        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Giriş yapılırken hata oluştu'
            };
        }
    }

    // Kullanıcı bilgilerini getir
    async getUserById(id) {
        try {
            const users = await this.getUsers();
            const user = users.find(u => u.id === id && u.isActive);
            
            if (user) {
                return {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    displayName: user.profile.displayName,
                    joinDate: user.profile.joinDate
                };
            }
            
            return null;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }

    // Şifre güncelle (e-posta ile)
    async updatePassword(email, newPassword) {
        try {
            const users = await this.getUsers();
            const userIndex = users.findIndex(u => u.email === email && u.isActive);
            
            if (userIndex === -1) {
                return {
                    success: false,
                    message: 'Kullanıcı bulunamadı'
                };
            }

            // Şifreyi hash'le ve güncelle
            users[userIndex].password = this.hashPassword(newPassword);
            users[userIndex].profile.lastPasswordUpdate = new Date().toISOString();
            
            const saved = await this.saveUsers(users);
            
            if (saved) {
                return {
                    success: true,
                    message: 'Şifre başarıyla güncellendi'
                };
            } else {
                return {
                    success: false,
                    message: 'Şifre güncellenirken hata oluştu'
                };
            }

        } catch (error) {
            console.error('Update password error:', error);
            return {
                success: false,
                message: 'Şifre güncelleme sırasında hata oluştu'
            };
        }
    }
}

module.exports = new UserService();
