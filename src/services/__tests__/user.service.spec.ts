import { userService } from '../user.service';
import { userRepository } from '../../repositories/user.repository';
import { connection as rabbitmqConnection } from '../../shared/lib/rabbitmq';
import { Channel } from 'amqplib';

jest.mock('../../repositories/user.repository');
jest.mock('../../shared/lib/rabbitmq');

const mockedUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockedRabbitmqConnection = rabbitmqConnection as jest.Mocked<typeof rabbitmqConnection>;

const mockChannel = {
  assertQueue: jest.fn(),
  sendToQueue: jest.fn(),
  close: jest.fn(),
} as unknown as jest.Mocked<Channel>;


describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (mockedRabbitmqConnection.createChannel as jest.Mock).mockReturnValue({
      ...mockChannel,
      waitForConnect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    });
  });

  describe('create method', () => {
    it('should create a new user and send a notification when email is not in use', async () => {
      const name = 'Test User';
      const email = 'test@example.com';
      const mockNewUser = { id: 'uuid-123', name, email, createdAt: new Date(), welcome_email_sent_at: null };

      mockedUserRepository.findByEmail.mockResolvedValue(null); 
      mockedUserRepository.create.mockResolvedValue(mockNewUser); 

      const result = await userService.create(name, email);

      expect(result).toEqual(mockNewUser);

      expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedUserRepository.create).toHaveBeenCalledWith({ name, email });
      
      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        'user-notifications-queue',
        expect.any(Buffer),
        { persistent: true }
      );
    });


    it('should throw an error if the email is already in use', async () => {
      const name = 'Another User';
      const email = 'existing@example.com';
      const mockExistingUser = { id: 'uuid-456', name: 'Existing', email, createdAt: new Date(), welcome_email_sent_at: null };

      mockedUserRepository.findByEmail.mockResolvedValue(mockExistingUser);

      await expect(userService.create(name, email)).rejects.toThrow('Email already in use.');

      expect(mockedUserRepository.create).not.toHaveBeenCalled();
      expect(mockedRabbitmqConnection.createChannel).not.toHaveBeenCalled();
    });
  });
});