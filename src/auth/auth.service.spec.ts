import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/users/entities/user.entity';
import { Identity } from './entities/identity.entity';
import { TypedConfigService } from 'src/config/TypedConfigService';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { AppLogger } from 'src/logger/logger.service';
import { RegisterDto } from './dtos/register.dto';
import { RegisterSeederDto } from './dtos/register-seeder.dto';
import { AuthProvider } from './enums/AuthProvider';
import * as argon2 from 'argon2'

jest.mock('argon2', () => ({
    hash: jest.fn(),
    verify: jest.fn(),
}));

describe('AuthService', () => {
    let authService: AuthService;
    let configService: jest.Mocked<TypedConfigService>;
    let jwtService: jest.Mocked<JwtService>;
    let mailService: jest.Mocked<MailService>;
    let userService: jest.Mocked<UsersService>;
    let userRepository: jest.Mocked<Repository<User>>;
    let identityRepository: jest.Mocked<Repository<Identity>>;
    let dataSource: jest.Mocked<DataSource>;
    let logger: jest.Mocked<AppLogger>;

    const mockUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        fullName: 'Test User',
        avatar: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        identities: [],
        roles: [],
        permissions: [],
    };

    const mockIdentity: Identity = {
        id: 'identity-id',
        provider: AuthProvider.LOCAL,
        providerUserId: 'test@example.com',
        passwordHash: 'hashed-password',
        isActive: false,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        verificationToken: 'verification-token',
        verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60),
        resetToken: null,
        resetTokenExpires: null,
        rawProfile: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
    };

    const mockJwtConfig = {
        accessSecret: 'access-secret',
        refreshSecret: 'refresh-secret',
        accessExpiresIn: '3600',
        refreshExpiresIn: '86400',
    };

    const mockAppConfig = {
        appDomain: 'http://localhost:3000',
    };

    const mockUserProfile = {
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['read'],
    };

    beforeEach(async () => {
        const mockConfigService = {
            getJwtConfig: jest.fn().mockReturnValue(mockJwtConfig),
            getAppConfig: jest.fn().mockReturnValue(mockAppConfig),
        };

        const mockJwtService = {
            signAsync: jest.fn(),
        };

        const mockMailService = {
            sendVerificationEmail: jest.fn(),
            sendForgotPassword: jest.fn(),
        };

        const mockUsersService = {
            getUserProfile: jest.fn(),
        };

        const mockUserRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        const mockIdentityRepo = {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
        };

        const mockLogger = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };

        const mockManager = {
            getRepository: jest.fn().mockReturnValue(mockUserRepo),
        };

        const mockDataSource = {
            transaction: jest.fn().mockImplementation(async (cb) => {
                return cb(mockManager);
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: TypedConfigService,
                    useValue: mockConfigService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: MailService,
                    useValue: mockMailService,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepo,
                },
                {
                    provide: getRepositoryToken(Identity),
                    useValue: mockIdentityRepo,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
                {
                    provide: AppLogger,
                    useValue: mockLogger,
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        configService = module.get(TypedConfigService);
        jwtService = module.get(JwtService);
        mailService = module.get(MailService);
        userService = module.get(UsersService);
        userRepository = module.get(getRepositoryToken(User));
        identityRepository = module.get(getRepositoryToken(Identity));
        dataSource = module.get(DataSource);
        logger = module.get(AppLogger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
    });


    describe('hashedPassword', () => {
        it('should hash a password', async () => {
            const password = 'password123';
            const hashedPassword = 'hashed-password-result';

            (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);

            const result = await authService.hashedPassword(password);

            expect(argon2.hash).toHaveBeenCalledWith(password);
            expect(result).toBe(hashedPassword);
        });
    });

    describe('verifiedPassword', () => {
        it('should return true for matching password', async () => {
            const plainPassword = 'password123';
            const storedPassword = 'hashed-password';

            jest.spyOn(argon2, 'verify').mockResolvedValue(true);

            const result = await authService.verifiedPassword(plainPassword, storedPassword);

            expect(argon2.verify).toHaveBeenCalledWith(storedPassword, plainPassword);
            expect(result).toBe(true);
        });

        it('should return false for non-matching password', async () => {
            const plainPassword = 'wrong-password';
            const storedPassword = 'hashed-password';

            jest.spyOn(argon2, 'verify').mockResolvedValue(false);

            const result = await authService.verifiedPassword(plainPassword, storedPassword);

            expect(argon2.verify).toHaveBeenCalledWith(storedPassword, plainPassword);
            expect(result).toBe(false);
        });

        it('should return false when storedPassword is undefined', async () => {
            const plainPassword = 'password123';

            const result = await authService.verifiedPassword(plainPassword, undefined);

            expect(result).toBe(false);
        });
    });

    describe('generateTokens', () => {
        it('should generate access and refresh tokens', async () => {
            const accessToken = 'access-token';
            const refreshToken = 'refresh-token';

            userService.getUserProfile.mockResolvedValue(mockUserProfile);
            jwtService.signAsync
                .mockResolvedValueOnce(accessToken)
                .mockResolvedValueOnce(refreshToken);

            const result = await authService.generateTokens(mockUser);

            expect(userService.getUserProfile).toHaveBeenCalledWith(mockUser.id);
            expect(configService.getJwtConfig).toHaveBeenCalled();
            expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
            expect(jwtService.signAsync).toHaveBeenNthCalledWith(
                1,
                {
                    sub: mockUser.id,
                    email: mockUserProfile.email,
                    roles: mockUserProfile.roles,
                    permissions: mockUserProfile.permissions,
                },
                {
                    secret: mockJwtConfig.accessSecret,
                    expiresIn: Number(mockJwtConfig.accessExpiresIn),
                },
            );
            expect(jwtService.signAsync).toHaveBeenNthCalledWith(
                2,
                {
                    sub: mockUser.id,
                    email: mockUserProfile.email,
                    roles: mockUserProfile.roles,
                    permissions: mockUserProfile.permissions,
                },
                {
                    secret: mockJwtConfig.refreshSecret,
                    expiresIn: Number(mockJwtConfig.refreshExpiresIn),
                },
            );
            expect(result).toEqual({
                accessToken,
                refreshToken,
            });
        });
    });

    describe('validateLocalUser', () => {
        it('should validate and return user for correct credentials', async () => {
            const email = 'test@example.com';
            const password = 'password123';

            const queryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(mockIdentity),
            };

            identityRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);
            jest.spyOn(authService, 'verifiedPassword').mockResolvedValue(true);

            const result = await authService.validateLocalUser(email, password);

            expect(identityRepository.createQueryBuilder).toHaveBeenCalledWith('identity');
            expect(queryBuilder.where).toHaveBeenCalledWith('identity.provider = :provider', {
                provider: AuthProvider.LOCAL,
            });
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(
                'identity.providerUserId = :email',
                { email },
            );
            expect(authService.verifiedPassword).toHaveBeenCalledWith(
                password,
                mockIdentity.passwordHash,
            );
            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                fullName: mockUser.fullName,
                avatar: mockUser.avatar,
            });
        });

        it('should throw UnauthorizedException when user not found', async () => {
            const email = 'nonexistent@example.com';
            const password = 'password123';

            const queryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null),
            };

            identityRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

            await expect(authService.validateLocalUser(email, password)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(logger.warn).toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when password hash is missing', async () => {
            const email = 'test@example.com';
            const password = 'password123';

            const identityWithoutPassword = { ...mockIdentity, passwordHash: null };

            const queryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(identityWithoutPassword),
            };

            identityRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

            await expect(authService.validateLocalUser(email, password)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(logger.warn).toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when password does not match', async () => {
            const email = 'test@example.com';
            const password = 'wrong-password';

            const queryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(mockIdentity),
            };

            identityRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);
            jest.spyOn(authService, 'verifiedPassword').mockResolvedValue(false);

            await expect(authService.validateLocalUser(email, password)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('validateOAuthLogin', () => {
        it('should return user when identity exists', async () => {
            const provider = AuthProvider.GOOGLE;
            const providerUserId = 'google-user-id';

            const queryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(mockIdentity),
            };

            identityRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

            const result = await authService.validateOAuthLogin(provider, providerUserId);

            expect(identityRepository.createQueryBuilder).toHaveBeenCalledWith('identity');
            expect(queryBuilder.where).toHaveBeenCalledWith('identity.provider = :provider', {
                provider,
            });
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(
                'identity.providerUserId = :providerUserId',
                { providerUserId },
            );
            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                fullName: mockUser.fullName,
                avatar: mockUser.avatar,
            });
        });

        it('should create new user and identity when identity does not exist', async () => {
            const provider = AuthProvider.GOOGLE;
            const providerUserId = 'google-user-id';
            const email = 'newuser@example.com';

            const queryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null),
            };

            identityRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

            const transactionManager = {
                getRepository: jest.fn(),
            };

            const userRepoInTransaction = {
                createQueryBuilder: jest.fn(),
                create: jest.fn(),
                save: jest.fn(),
            };

            const identityRepoInTransaction = {
                create: jest.fn(),
                save: jest.fn(),
            };

            const userQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null),
            };

            userRepoInTransaction.createQueryBuilder.mockReturnValue(userQueryBuilder as any);
            userRepoInTransaction.create.mockReturnValue(mockUser);
            userRepoInTransaction.save.mockResolvedValue(mockUser);
            identityRepoInTransaction.create.mockReturnValue(mockIdentity);
            identityRepoInTransaction.save.mockResolvedValue(mockIdentity);

            transactionManager.getRepository
                .mockReturnValueOnce(userRepoInTransaction)
                .mockReturnValueOnce(identityRepoInTransaction);

            dataSource.transaction.mockImplementation(async (callback: any) => {
                return await callback(transactionManager);
            });

            const result = await authService.validateOAuthLogin(provider, providerUserId, email);

            expect(dataSource.transaction).toHaveBeenCalled();
            expect(userRepoInTransaction.create).toHaveBeenCalledWith({ email });
            expect(identityRepoInTransaction.create).toHaveBeenCalledWith({
                provider,
                providerUserId,
                user: mockUser,
            });
            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                fullName: mockUser.fullName,
                avatar: mockUser.avatar,
            });
        });

        it('should throw BadRequestException when email is missing for new OAuth user', async () => {
            const provider = AuthProvider.GOOGLE;
            const providerUserId = 'google-user-id';

            const queryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null),
            };

            identityRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

            await expect(
                authService.validateOAuthLogin(provider, providerUserId),
            ).rejects.toThrow(BadRequestException);
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('generateToken', () => {
        it('should generate a random token', () => {
            const token1 = authService.generateToken();
            const token2 = authService.generateToken();

            expect(token1).toBeDefined();
            expect(token2).toBeDefined();
            expect(token1).not.toBe(token2);
            expect(token1.length).toBe(64); // 32 bytes = 64 hex characters
        });
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const registerDto: RegisterDto = {
                email: 'newuser@example.com',
                password: 'password123',
                provider: AuthProvider.LOCAL,
            };

            const hashedPassword = 'hashed-password';
            jest.spyOn(authService, 'hashedPassword').mockResolvedValue(hashedPassword);

            const transactionManager = {
                getRepository: jest.fn(),
            };

            const userRepoInTransaction = {
                create: jest.fn().mockReturnValue(mockUser),
                save: jest.fn().mockResolvedValue(mockUser),
            };

            const identityRepoInTransaction = {
                create: jest.fn().mockReturnValue(mockIdentity),
                save: jest.fn().mockResolvedValue(mockIdentity),
            };

            transactionManager.getRepository
                .mockReturnValueOnce(userRepoInTransaction)
                .mockReturnValueOnce(identityRepoInTransaction);

            (dataSource.transaction as jest.Mock).mockImplementation(async (callback) => {
                return await callback(transactionManager);
            });

            (mailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);


            const result = await authService.register(registerDto);

            expect(authService.hashedPassword).toHaveBeenCalledWith(registerDto.password);
            expect(dataSource.transaction).toHaveBeenCalled();
            expect(userRepoInTransaction.create).toHaveBeenCalledWith({ email: registerDto.email });
            expect(identityRepoInTransaction.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    provider: AuthProvider.LOCAL,
                    providerUserId: registerDto.email,
                    passwordHash: hashedPassword,
                    user: mockUser,
                }),
            );
            expect(configService.getAppConfig).toHaveBeenCalled();
            expect(mailService.sendVerificationEmail).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it('should handle registration errors', async () => {
            const registerDto: RegisterDto = {
                email: 'existing@example.com',
                password: 'password123',
                provider: AuthProvider.LOCAL,
            };

            const error = new Error('User already exists');
            dataSource.transaction.mockRejectedValue(error);

            await expect(authService.register(registerDto)).rejects.toThrow('User already exists');
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('activeAccount', () => {
        it('should activate user account with valid token', async () => {
            const token = 'valid-token';
            const activeIdentity = { ...mockIdentity, isActive: false };

            identityRepository.findOne.mockResolvedValue(activeIdentity as Identity);
            identityRepository.save.mockResolvedValue(activeIdentity as Identity);

            const result = await authService.activeAccount(token);

            expect(identityRepository.findOne).toHaveBeenCalledWith({
                where: [{ verificationToken: token }],
                relations: ['user'],
            });
            expect(identityRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    verificationToken: null,
                    verificationTokenExpires: null,
                    isActive: true,
                }),
            );
            expect(result).toEqual(mockUser);
        });

        it('should throw BadRequestException when token is invalid', async () => {
            const token = 'invalid-token';

            identityRepository.findOne.mockResolvedValue(null);

            await expect(authService.activeAccount(token)).rejects.toThrow(BadRequestException);
            expect(logger.warn).toHaveBeenCalled();
        });

        it('should throw BadRequestException when token is expired', async () => {
            const token = 'expired-token';
            const expiredIdentity = {
                ...mockIdentity,
                verificationTokenExpires: new Date(Date.now() - 1000),
            };

            identityRepository.findOne.mockResolvedValue(expiredIdentity as Identity);

            await expect(authService.activeAccount(token)).rejects.toThrow(BadRequestException);
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('forgotPassword', () => {
        it('should send forgot password email successfully', async () => {
            const email = 'test@example.com';
            const userWithIdentities = {
                ...mockUser,
                identities: [mockIdentity],
            };

            userRepository.findOne.mockResolvedValue(userWithIdentities as User);
            identityRepository.save.mockResolvedValue(mockIdentity);
            mailService.sendForgotPassword.mockResolvedValue(undefined);

            await authService.forgotPassword(email);

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { email },
                relations: ['identities'],
            });
            expect(identityRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    resetToken: expect.any(String),
                    resetTokenExpires: expect.any(Date),
                }),
            );
            expect(configService.getAppConfig).toHaveBeenCalled();
            expect(mailService.sendForgotPassword).toHaveBeenCalled();
        });

        it('should throw NotFoundException when user not found', async () => {
            const email = 'nonexistent@example.com';

            userRepository.findOne.mockResolvedValue(null);

            await expect(authService.forgotPassword(email)).rejects.toThrow(NotFoundException);
            expect(logger.warn).toHaveBeenCalled();
        });

        it('should throw BadRequestException when no LOCAL identity exists', async () => {
            const email = 'test@example.com';
            const googleIdentity = {
                ...mockIdentity,
                provider: AuthProvider.GOOGLE,
            };
            const userWithGoogleIdentity = {
                ...mockUser,
                identities: [googleIdentity],
            };

            userRepository.findOne.mockResolvedValue(userWithGoogleIdentity as User);

            await expect(authService.forgotPassword(email)).rejects.toThrow(BadRequestException);
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('resetPassword', () => {
        it('should reset password with valid token', async () => {
            const token = 'valid-reset-token';
            const newPassword = 'newPassword123';
            const identityWithResetToken = {
                ...mockIdentity,
                resetToken: token,
                resetTokenExpires: new Date(Date.now() + 15 * 60 * 1000),
            };

            const hashedPassword = 'new-hashed-password';
            jest.spyOn(authService, 'hashedPassword').mockResolvedValue(hashedPassword);

            identityRepository.findOne.mockResolvedValue(identityWithResetToken as Identity);
            identityRepository.save.mockResolvedValue(identityWithResetToken as Identity);

            await authService.resetPassword(newPassword, token);

            expect(identityRepository.findOne).toHaveBeenCalledWith({
                where: [{ resetToken: token }],
            });
            expect(authService.hashedPassword).toHaveBeenCalledWith(newPassword);
            expect(identityRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    passwordHash: hashedPassword,
                    resetToken: null,
                    resetTokenExpires: null,
                }),
            );
        });

        it('should throw BadRequestException when token is invalid', async () => {
            const token = 'invalid-token';
            const newPassword = 'newPassword123';

            identityRepository.findOne.mockResolvedValue(null);

            await expect(authService.resetPassword(newPassword, token)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException when token is expired', async () => {
            const token = 'expired-token';
            const newPassword = 'newPassword123';
            const expiredIdentity = {
                ...mockIdentity,
                resetToken: token,
                resetTokenExpires: new Date(Date.now() - 1000),
            };

            identityRepository.findOne.mockResolvedValue(expiredIdentity as Identity);

            await expect(authService.resetPassword(newPassword, token)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('registerSeeder', () => {
        it('should register a user with seeder data', async () => {
            const registerSeederDto: RegisterSeederDto = {
                email: 'seeder@example.com',
                password: 'password123',
                provider: AuthProvider.LOCAL,
                roles: [],
            };

            const hashedPassword = 'hashed-password';
            jest.spyOn(authService, 'hashedPassword').mockResolvedValue(hashedPassword);

            const transactionManager = {
                getRepository: jest.fn(),
            };

            const userRepoInTransaction = {
                create: jest.fn().mockReturnValue(mockUser),
                save: jest.fn().mockResolvedValue(mockUser),
            };

            const identityRepoInTransaction = {
                create: jest.fn().mockReturnValue(mockIdentity),
                save: jest.fn().mockResolvedValue(mockIdentity),
            };

            transactionManager.getRepository
                .mockReturnValueOnce(userRepoInTransaction)
                .mockReturnValueOnce(identityRepoInTransaction);

            (dataSource.transaction as jest.Mock).mockImplementation(async (callback: (tm: any) => any) => {
                return callback(transactionManager);
            });

            const result = await authService.registerSeeder(registerSeederDto);

            expect(authService.hashedPassword).toHaveBeenCalledWith(registerSeederDto.password);
            expect(dataSource.transaction).toHaveBeenCalled();
            expect(userRepoInTransaction.create).toHaveBeenCalledWith({
                email: registerSeederDto.email,
                roles: registerSeederDto.roles,
            });
            expect(identityRepoInTransaction.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    provider: AuthProvider.LOCAL,
                    providerUserId: registerSeederDto.email,
                    passwordHash: hashedPassword,
                    user: mockUser,
                    isActive: true,
                }),
            );
            expect(result).toEqual(mockUser);
        });

        it('should handle seeder registration errors', async () => {
            const registerSeederDto: RegisterSeederDto = {
                email: 'seeder@example.com',
                password: 'password123',
                provider: AuthProvider.LOCAL,
                roles: [],
            };

            const error = new Error('Registration failed');
            dataSource.transaction.mockRejectedValue(error);

            await expect(authService.registerSeeder(registerSeederDto)).rejects.toThrow(
                'Registration failed',
            );
            expect(logger.error).toHaveBeenCalled();
        });
    });
});
