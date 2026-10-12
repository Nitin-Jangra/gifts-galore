import defaultUserRepository from '../repositories/user.repository.js';
import { hashPassword, verifyPassword, signToken } from '../utils/security.js';

export class AuthService {
  constructor(userRepository = defaultUserRepository) {
    this.userRepo = userRepository;
  }

  sanitizeUser(user) {
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async registerCustomer(data) {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      const err = new Error('An account with this email address already exists.');
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await hashPassword(data.password);
    const user = await this.userRepo.createCustomer({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async registerSeller(data) {
    const isPublicRegistrationEnabled = process.env.ENABLE_PUBLIC_SELLER_REGISTRATION === 'true';
    if (!isPublicRegistrationEnabled) {
      const err = new Error('Public seller registration is currently disabled. Please contact Gifts Galore platform administration.');
      err.statusCode = 403;
      throw err;
    }

    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      const err = new Error('An account with this email address already exists.');
      err.statusCode = 409;
      throw err;
    }

    const slug = data.storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const passwordHash = await hashPassword(data.password);
    const userWithSeller = await this.userRepo.createSeller({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      storeName: data.storeName,
      slug,
      description: data.description,
      city: data.city,
      state: data.state,
    });

    const token = signToken({
      id: userWithSeller.id,
      email: userWithSeller.email,
      role: userWithSeller.role,
      sellerId: userWithSeller.sellerProfile?.id,
    });

    return {
      user: this.sanitizeUser(userWithSeller),
      token,
    };
  }

  async login({ email, password }) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await verifyPassword(user.passwordHash, password);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    if (user.status === 'SUSPENDED' || user.status === 'BLOCKED') {
      const err = new Error(`Your account has been ${user.status.toLowerCase()}. Access is denied.`);
      err.statusCode = 403;
      throw err;
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      sellerId: user.sellerProfile?.id,
    });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getCurrentUser(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    return this.sanitizeUser(user);
  }
}

export default new AuthService();
