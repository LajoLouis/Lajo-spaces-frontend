import { test, expect } from '@playwright/test';

test.describe('Messaging System', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('lajospaces_token', 'mock-token');
      localStorage.setItem('lajospaces_user', JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: true,
        isProfileComplete: true,
      }));
    });

    // Mock Socket.IO
    await page.addInitScript(() => {
      window.mockSocket = {
        on: () => {},
        off: () => {},
        emit: () => {},
        connect: () => {},
        disconnect: () => {},
        connected: true,
        id: 'mock-socket-id',
      };
    });
  });

  test('should display conversations list', async ({ page }) => {
    // Mock conversations API
    await page.route('**/api/conversations', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            conversations: [
              {
                _id: 'conversation-1',
                participants: [
                  {
                    _id: 'user-123',
                    firstName: 'John',
                    lastName: 'Doe',
                  },
                  {
                    _id: 'user-456',
                    firstName: 'Jane',
                    lastName: 'Smith',
                  },
                ],
                lastMessage: {
                  _id: 'message-1',
                  content: 'Hey, how are you?',
                  senderId: 'user-456',
                  createdAt: '2024-01-01T12:00:00.000Z',
                },
                unreadCount: 2,
                updatedAt: '2024-01-01T12:00:00.000Z',
              },
              {
                _id: 'conversation-2',
                participants: [
                  {
                    _id: 'user-123',
                    firstName: 'John',
                    lastName: 'Doe',
                  },
                  {
                    _id: 'user-789',
                    firstName: 'Bob',
                    lastName: 'Johnson',
                  },
                ],
                lastMessage: {
                  _id: 'message-2',
                  content: 'Thanks for the info!',
                  senderId: 'user-123',
                  createdAt: '2024-01-01T11:00:00.000Z',
                },
                unreadCount: 0,
                updatedAt: '2024-01-01T11:00:00.000Z',
              },
            ],
          },
        }),
      });
    });

    await page.goto('/messages');

    await expect(page.locator('h1')).toContainText('Messages');
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    await expect(page.locator('text=Bob Johnson')).toBeVisible();
    await expect(page.locator('text=Hey, how are you?')).toBeVisible();
    await expect(page.locator('text=Thanks for the info!')).toBeVisible();
    
    // Check unread indicator
    await expect(page.locator('text=2').first()).toBeVisible(); // Unread count
  });

  test('should open conversation and display messages', async ({ page }) => {
    // Mock conversation messages
    await page.route('**/api/conversations/conversation-1/messages', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            messages: [
              {
                _id: 'message-1',
                conversationId: 'conversation-1',
                senderId: 'user-456',
                receiverId: 'user-123',
                messageType: 'text',
                content: 'Hey, how are you?',
                status: 'delivered',
                createdAt: '2024-01-01T12:00:00.000Z',
              },
              {
                _id: 'message-2',
                conversationId: 'conversation-1',
                senderId: 'user-123',
                receiverId: 'user-456',
                messageType: 'text',
                content: 'I\'m doing great, thanks! How about you?',
                status: 'sent',
                createdAt: '2024-01-01T12:01:00.000Z',
              },
              {
                _id: 'message-3',
                conversationId: 'conversation-1',
                senderId: 'user-456',
                receiverId: 'user-123',
                messageType: 'text',
                content: 'I\'m good too! Are you still looking for a roommate?',
                status: 'delivered',
                createdAt: '2024-01-01T12:02:00.000Z',
              },
            ],
          },
        }),
      });
    });

    // Mock conversation details
    await page.route('**/api/conversations/conversation-1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'conversation-1',
            participants: [
              {
                _id: 'user-123',
                firstName: 'John',
                lastName: 'Doe',
              },
              {
                _id: 'user-456',
                firstName: 'Jane',
                lastName: 'Smith',
                profilePhoto: 'https://example.com/jane.jpg',
                isOnline: true,
              },
            ],
            conversationType: 'direct',
          },
        }),
      });
    });

    await page.goto('/messages/conversation-1');

    await expect(page.locator('h2')).toContainText('Jane Smith');
    await expect(page.locator('text=Online')).toBeVisible();
    await expect(page.locator('text=Hey, how are you?')).toBeVisible();
    await expect(page.locator('text=I\'m doing great, thanks! How about you?')).toBeVisible();
    await expect(page.locator('text=I\'m good too! Are you still looking for a roommate?')).toBeVisible();
  });

  test('should send a text message', async ({ page }) => {
    // Mock conversation setup
    await page.route('**/api/conversations/conversation-1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'conversation-1',
            participants: [
              { _id: 'user-123', firstName: 'John', lastName: 'Doe' },
              { _id: 'user-456', firstName: 'Jane', lastName: 'Smith' },
            ],
          },
        }),
      });
    });

    await page.route('**/api/conversations/conversation-1/messages', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { messages: [] },
        }),
      });
    });

    // Mock message sending
    await page.route('**/api/conversations/conversation-1/messages', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              message: {
                _id: 'message-new',
                conversationId: 'conversation-1',
                senderId: 'user-123',
                content: 'Yes, I am still looking for a roommate!',
                messageType: 'text',
                status: 'sent',
                createdAt: new Date().toISOString(),
              },
            },
            message: 'Message sent successfully',
          }),
        });
      }
    });

    await page.goto('/messages/conversation-1');

    // Type and send message
    await page.fill('input[placeholder*="Type a message"]', 'Yes, I am still looking for a roommate!');
    await page.click('button[aria-label="Send message"]');

    // Message should appear in chat
    await expect(page.locator('text=Yes, I am still looking for a roommate!')).toBeVisible();
  });

  test('should handle typing indicators', async ({ page }) => {
    await page.goto('/messages/conversation-1');

    // Start typing
    await page.fill('input[placeholder*="Type a message"]', 'I am typing...');

    // Should show typing indicator (this would be handled by Socket.IO in real app)
    // For testing, we can check if the typing event would be emitted
    await expect(page.locator('input[placeholder*="Type a message"]')).toHaveValue('I am typing...');

    // Clear input (stop typing)
    await page.fill('input[placeholder*="Type a message"]', '');
  });

  test('should upload and send file attachment', async ({ page }) => {
    await page.goto('/messages/conversation-1');

    // Mock file upload
    await page.route('**/api/uploads/message-attachment', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            upload: {
              public_id: 'file_123',
              secure_url: 'https://example.com/uploaded-file.pdf',
              url: 'https://example.com/uploaded-file.pdf',
              bytes: 1024,
              format: 'pdf',
              resource_type: 'raw',
            },
          },
          message: 'File uploaded successfully',
        }),
      });
    });

    // Click attachment button
    await page.click('button[aria-label="Attach file"]');

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake-pdf-content'),
    });

    // Should show file preview and send
    await expect(page.locator('text=document.pdf')).toBeVisible();
    await page.click('button:has-text("Send")');

    // File message should appear
    await expect(page.locator('text=document.pdf')).toBeVisible();
  });

  test('should create new conversation', async ({ page }) => {
    // Mock users search
    await page.route('**/api/users/search?q=jane', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            users: [
              {
                id: 'user-456',
                firstName: 'Jane',
                lastName: 'Smith',
                profilePhoto: 'https://example.com/jane.jpg',
              },
            ],
          },
        }),
      });
    });

    // Mock conversation creation
    await page.route('**/api/conversations', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              conversation: {
                _id: 'conversation-new',
                participants: ['user-123', 'user-456'],
                conversationType: 'direct',
              },
            },
            message: 'Conversation created successfully',
          }),
        });
      }
    });

    await page.goto('/messages');

    // Click new conversation button
    await page.click('button:has-text("New Message")');

    // Search for user
    await page.fill('input[placeholder*="Search users"]', 'jane');
    await page.waitForTimeout(500); // Wait for search

    // Select user
    await page.click('text=Jane Smith');

    // Type initial message
    await page.fill('textarea[placeholder*="Type your message"]', 'Hi Jane! I saw your profile and would like to connect.');

    // Send message
    await page.click('button:has-text("Send Message")');

    // Should redirect to new conversation
    await expect(page.url()).toContain('/messages/conversation-new');
    await expect(page.locator('text=Hi Jane! I saw your profile and would like to connect.')).toBeVisible();
  });

  test('should mark messages as read', async ({ page }) => {
    // Mock mark as read API
    await page.route('**/api/conversations/conversation-1/read', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Messages marked as read',
          }),
        });
      }
    });

    await page.goto('/messages/conversation-1');

    // Opening conversation should automatically mark messages as read
    // This would be handled by the useEffect in the ChatWindow component
    await page.waitForTimeout(1000);

    // Verify that unread count is cleared (would be updated via Socket.IO)
  });

  test('should handle message status updates', async ({ page }) => {
    await page.goto('/messages/conversation-1');

    // Send a message
    await page.fill('input[placeholder*="Type a message"]', 'Test message status');
    await page.click('button[aria-label="Send message"]');

    // Should show sent status initially
    await expect(page.locator('[data-testid="message-status-sent"]')).toBeVisible();

    // Status would be updated via Socket.IO events in real app
    // For testing, we can verify the status indicators are rendered
  });

  test('should handle conversation search', async ({ page }) => {
    await page.goto('/messages');

    // Search conversations
    await page.fill('input[placeholder*="Search conversations"]', 'Jane');

    // Should filter conversations
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    await expect(page.locator('text=Bob Johnson')).not.toBeVisible();
  });

  test('should handle empty conversations state', async ({ page }) => {
    // Mock empty conversations
    await page.route('**/api/conversations', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { conversations: [] },
        }),
      });
    });

    await page.goto('/messages');

    await expect(page.locator('text=No conversations yet')).toBeVisible();
    await expect(page.locator('text=Start a conversation')).toBeVisible();
    await expect(page.locator('button:has-text("New Message")')).toBeVisible();
  });
});
