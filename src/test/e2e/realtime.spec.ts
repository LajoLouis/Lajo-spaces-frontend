import { test, expect } from '@playwright/test';

test.describe('Real-time Features', () => {
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
  });

  test('should establish Socket.IO connection', async ({ page }) => {
    // Mock Socket.IO connection
    await page.addInitScript(() => {
      window.mockSocketEvents = [];
      window.io = () => ({
        on: (event, callback) => {
          window.mockSocketEvents.push({ event, callback });
          if (event === 'connect') {
            setTimeout(() => callback(), 100);
          }
        },
        off: () => {},
        emit: (event, data) => {
          console.log('Socket emit:', event, data);
        },
        connect: () => {},
        disconnect: () => {},
        connected: true,
        id: 'mock-socket-id',
      });
    });

    await page.goto('/dashboard');

    // Check for connection status indicator
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected');
  });

  test('should display connection status changes', async ({ page }) => {
    let socketInstance;
    
    await page.addInitScript(() => {
      window.mockSocket = {
        on: (event, callback) => {
          if (event === 'connect') {
            setTimeout(() => callback(), 100);
          } else if (event === 'disconnect') {
            // Will be triggered manually in test
          }
        },
        off: () => {},
        emit: () => {},
        connect: () => {},
        disconnect: () => {
          // Simulate disconnect
          window.mockSocket.connected = false;
        },
        connected: true,
        id: 'mock-socket-id',
      };
      
      window.io = () => window.mockSocket;
    });

    await page.goto('/messages');

    // Should show connected status
    await expect(page.locator('text=Online')).toBeVisible();

    // Simulate disconnect
    await page.evaluate(() => {
      window.mockSocket.connected = false;
      // Trigger disconnect event
      const disconnectEvent = new CustomEvent('socket-disconnect');
      window.dispatchEvent(disconnectEvent);
    });

    // Should show disconnected status
    await expect(page.locator('text=Offline')).toBeVisible();
  });

  test('should handle real-time message receiving', async ({ page }) => {
    await page.addInitScript(() => {
      window.mockSocket = {
        on: (event, callback) => {
          window.mockSocket.callbacks = window.mockSocket.callbacks || {};
          window.mockSocket.callbacks[event] = callback;
          
          if (event === 'connect') {
            setTimeout(() => callback(), 100);
          }
        },
        off: () => {},
        emit: () => {},
        connect: () => {},
        disconnect: () => {},
        connected: true,
        id: 'mock-socket-id',
      };
      
      window.io = () => window.mockSocket;
    });

    // Mock conversation data
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

    await page.goto('/messages/conversation-1');

    // Simulate receiving a new message
    await page.evaluate(() => {
      const newMessageData = {
        message: {
          _id: 'message-new',
          conversationId: 'conversation-1',
          senderId: 'user-456',
          content: 'Hello from real-time test!',
          messageType: 'text',
          status: 'delivered',
          createdAt: new Date().toISOString(),
        },
        conversationId: 'conversation-1',
      };
      
      if (window.mockSocket.callbacks['new_message']) {
        window.mockSocket.callbacks['new_message'](newMessageData);
      }
    });

    // Should display the new message
    await expect(page.locator('text=Hello from real-time test!')).toBeVisible();
  });

  test('should show typing indicators', async ({ page }) => {
    await page.addInitScript(() => {
      window.mockSocket = {
        on: (event, callback) => {
          window.mockSocket.callbacks = window.mockSocket.callbacks || {};
          window.mockSocket.callbacks[event] = callback;
        },
        off: () => {},
        emit: (event, data) => {
          console.log('Emitting:', event, data);
        },
        connect: () => {},
        disconnect: () => {},
        connected: true,
        id: 'mock-socket-id',
      };
      
      window.io = () => window.mockSocket;
    });

    await page.goto('/messages/conversation-1');

    // Start typing
    await page.fill('input[placeholder*="Type a message"]', 'I am typing...');

    // Should emit typing start event
    await page.waitForTimeout(500);

    // Simulate someone else typing
    await page.evaluate(() => {
      const typingData = {
        userId: 'user-456',
        conversationId: 'conversation-1',
        isTyping: true,
      };
      
      if (window.mockSocket.callbacks['user_typing']) {
        window.mockSocket.callbacks['user_typing'](typingData);
      }
    });

    // Should show typing indicator
    await expect(page.locator('text=is typing')).toBeVisible();

    // Stop typing
    await page.evaluate(() => {
      const typingData = {
        userId: 'user-456',
        conversationId: 'conversation-1',
        isTyping: false,
      };
      
      if (window.mockSocket.callbacks['user_typing']) {
        window.mockSocket.callbacks['user_typing'](typingData);
      }
    });

    // Typing indicator should disappear
    await expect(page.locator('text=is typing')).not.toBeVisible();
  });

  test('should handle real-time notifications', async ({ page }) => {
    // Request notification permission
    await page.context().grantPermissions(['notifications']);

    await page.addInitScript(() => {
      window.mockSocket = {
        on: (event, callback) => {
          window.mockSocket.callbacks = window.mockSocket.callbacks || {};
          window.mockSocket.callbacks[event] = callback;
        },
        off: () => {},
        emit: () => {},
        connect: () => {},
        disconnect: () => {},
        connected: true,
        id: 'mock-socket-id',
      };
      
      window.io = () => window.mockSocket;
    });

    await page.goto('/dashboard');

    // Simulate new message notification
    await page.evaluate(() => {
      const messageData = {
        message: {
          _id: 'message-notif',
          senderId: 'user-456',
          content: 'You have a new message!',
        },
        conversationId: 'conversation-1',
      };
      
      if (window.mockSocket.callbacks['new_message']) {
        window.mockSocket.callbacks['new_message'](messageData);
      }
    });

    // Should show toast notification
    await expect(page.locator('text=New Message')).toBeVisible();
  });

  test('should handle message status updates', async ({ page }) => {
    await page.goto('/messages/conversation-1');

    // Send a message
    await page.fill('input[placeholder*="Type a message"]', 'Test message status');
    await page.click('button[aria-label="Send message"]');

    // Simulate message status updates
    await page.evaluate(() => {
      // Message sent confirmation
      const sentData = {
        tempId: 'temp_123',
        message: {
          _id: 'message-sent',
          status: 'sent',
        },
      };
      
      if (window.mockSocket.callbacks['message_sent']) {
        window.mockSocket.callbacks['message_sent'](sentData);
      }

      // Message delivered
      setTimeout(() => {
        const deliveredData = {
          messageId: 'message-sent',
          deliveredAt: new Date().toISOString(),
        };
        
        if (window.mockSocket.callbacks['message_delivered']) {
          window.mockSocket.callbacks['message_delivered'](deliveredData);
        }
      }, 1000);

      // Message read
      setTimeout(() => {
        const readData = {
          messageId: 'message-sent',
          readAt: new Date().toISOString(),
        };
        
        if (window.mockSocket.callbacks['message_read']) {
          window.mockSocket.callbacks['message_read'](readData);
        }
      }, 2000);
    });

    // Should show status updates
    await expect(page.locator('[data-testid="message-status-sent"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-status-delivered"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-status-read"]')).toBeVisible();
  });

  test('should handle user presence updates', async ({ page }) => {
    await page.goto('/messages');

    // Simulate user coming online
    await page.evaluate(() => {
      const onlineData = {
        userId: 'user-456',
        status: 'online',
      };
      
      if (window.mockSocket.callbacks['user_status_changed']) {
        window.mockSocket.callbacks['user_status_changed'](onlineData);
      }
    });

    // Should update user status
    await expect(page.locator('text=Online')).toBeVisible();

    // Simulate user going offline
    await page.evaluate(() => {
      const offlineData = {
        userId: 'user-456',
        status: 'offline',
      };
      
      if (window.mockSocket.callbacks['user_status_changed']) {
        window.mockSocket.callbacks['user_status_changed'](offlineData);
      }
    });

    // Should update user status
    await expect(page.locator('text=Offline')).toBeVisible();
  });

  test('should handle connection errors and reconnection', async ({ page }) => {
    await page.addInitScript(() => {
      window.mockSocket = {
        on: (event, callback) => {
          window.mockSocket.callbacks = window.mockSocket.callbacks || {};
          window.mockSocket.callbacks[event] = callback;
        },
        off: () => {},
        emit: () => {},
        connect: () => {
          // Simulate reconnection
          setTimeout(() => {
            if (window.mockSocket.callbacks['connect']) {
              window.mockSocket.callbacks['connect']();
            }
          }, 1000);
        },
        disconnect: () => {},
        connected: false,
        id: null,
      };
      
      window.io = () => window.mockSocket;
    });

    await page.goto('/messages');

    // Simulate connection error
    await page.evaluate(() => {
      const error = new Error('Connection failed');
      if (window.mockSocket.callbacks['connect_error']) {
        window.mockSocket.callbacks['connect_error'](error);
      }
    });

    // Should show connection error
    await expect(page.locator('text=Connection error')).toBeVisible();

    // Should show reconnect button
    await expect(page.locator('button:has-text("Reconnect")')).toBeVisible();

    // Click reconnect
    await page.click('button:has-text("Reconnect")');

    // Should show connecting status
    await expect(page.locator('text=Connecting')).toBeVisible();

    // Simulate successful reconnection
    await page.evaluate(() => {
      window.mockSocket.connected = true;
      window.mockSocket.id = 'new-socket-id';
      
      if (window.mockSocket.callbacks['connect']) {
        window.mockSocket.callbacks['connect']();
      }
    });

    // Should show connected status
    await expect(page.locator('text=Connected')).toBeVisible();
  });

  test('should handle multiple browser tabs synchronization', async ({ context }) => {
    // Create two pages (tabs)
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Setup both pages
    for (const page of [page1, page2]) {
      await page.addInitScript(() => {
        localStorage.setItem('lajospaces_token', 'mock-token');
        localStorage.setItem('lajospaces_user', JSON.stringify({
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        }));
      });
    }

    await page1.goto('/messages/conversation-1');
    await page2.goto('/messages/conversation-1');

    // Send message from page1
    await page1.fill('input[placeholder*="Type a message"]', 'Message from tab 1');
    await page1.click('button[aria-label="Send message"]');

    // Message should appear in both tabs
    await expect(page1.locator('text=Message from tab 1')).toBeVisible();
    await expect(page2.locator('text=Message from tab 1')).toBeVisible();

    await page1.close();
    await page2.close();
  });
});
