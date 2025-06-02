import { Service, OtpSession, ApiResponse } from '../types';

// SMS-Activate.io API configuration
// IMPORTANT: Replace with your actual API key from SMS-Activate.io
const API_KEY = import.meta.env.VITE_SMS_ACTIVATE_API_KEY || 'your-sms-activate-api-key';
const BASE_URL = 'https://api.sms-activate.org/stubs/handler_api.php';

// Service IDs for SMS-Activate.io
// These need to be the actual service codes from SMS-Activate
// You can find these in their API documentation
const SERVICE_CODES = {
  'Flipkart': 'fl', // Replace with actual code for Flipkart
  'Zepto': 'zp',    // Replace with actual code for Zepto
};

// Store active sessions
const activeSessions: OtpSession[] = [];

// Helper function to make API requests to SMS-Activate
async function makeApiRequest(params: Record<string, string>): Promise<any> {
  const url = new URL(BASE_URL);
  url.searchParams.append('api_key', API_KEY);
  
  // Add all params to the URL
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  try {
    const response = await fetch(url.toString());
    const text = await response.text();
    
    // SMS-Activate API returns different formats based on the endpoint
    // Sometimes it's JSON, sometimes it's plain text with specific formats
    if (text.startsWith('ACCESS_BALANCE')) {
      // Balance response format: ACCESS_BALANCE:123.45
      return text.split(':')[1];
    } else if (text.startsWith('ACCESS_NUMBER')) {
      // Number response format: ACCESS_NUMBER:12345:79998887766
      const parts = text.split(':');
      return {
        id: parts[1],
        number: parts[2]
      };
    } else if (text === 'NO_NUMBERS') {
      throw new Error('No phone numbers available for this service');
    } else if (text === 'NO_BALANCE') {
      throw new Error('Insufficient balance in SMS-Activate account');
    } else if (text === 'BAD_KEY') {
      throw new Error('Invalid API key');
    } else if (text === 'ERROR_SQL') {
      throw new Error('Database error on SMS-Activate server');
    } else {
      // Try to parse as JSON if possible
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
  } catch (error) {
    console.error('SMS-Activate API error:', error);
    throw error;
  }
}

export const getAvailableServices = async (): Promise<ApiResponse<Service[]>> => {
  try {
    // Get current prices from SMS-Activate
    const response = await makeApiRequest({
      'action': 'getPrices',
      'country': '22' // India country code, change if needed
    });
    
    // For now, we'll return our predefined services with updated prices if available
    const services: Service[] = [
      {
        id: '1',
        name: 'Flipkart',
        price: response[SERVICE_CODES.Flipkart]?.cost || 20,
        description: 'Receive OTP for Flipkart account verification',
        isActive: !!response[SERVICE_CODES.Flipkart],
        icon: 'shopping-bag',
      },
      {
        id: '2',
        name: 'Zepto',
        price: response[SERVICE_CODES.Zepto]?.cost || 25,
        description: 'Receive OTP for Zepto account verification',
        isActive: !!response[SERVICE_CODES.Zepto],
        icon: 'shopping-cart',
      },
    ];
    
    return {
      success: true,
      data: services,
    };
  } catch (error) {
    console.error('Error fetching services:', error);
    // Fallback to predefined services if API fails
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Flipkart',
          price: 20,
          description: 'Receive OTP for Flipkart account verification',
          isActive: true,
          icon: 'shopping-bag',
        },
        {
          id: '2',
          name: 'Zepto',
          price: 25,
          description: 'Receive OTP for Zepto account verification',
          isActive: true,
          icon: 'shopping-cart',
        },
      ],
    };
  }
};

export const requestNumber = async (serviceId: string, userId: string): Promise<ApiResponse<OtpSession>> => {
  try {
    // Find the service name based on serviceId
    const serviceName = serviceId === '1' ? 'Flipkart' : 'Zepto';
    const serviceCode = SERVICE_CODES[serviceName];
    
    if (!serviceCode) {
      return {
        success: false,
        error: 'Service not found',
      };
    }
    
    // Request a number from SMS-Activate
    const result = await makeApiRequest({
      'action': 'getNumber',
      'service': serviceCode,
      'country': '22', // India country code
    });
    
    // Create a new OTP session
    const newSession: OtpSession = {
      id: result.id,
      userId,
      serviceId,
      operatorId: '1', // Default operator ID
      number: result.number,
      otp: null,
      sessionToken: result.id, // Use the SMS-Activate ID as our session token
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    // Store the session
    activeSessions.push(newSession);
    
    // Set the status to READY to notify SMS-Activate we're waiting for the code
    await makeApiRequest({
      'action': 'setStatus',
      'id': result.id,
      'status': '1', // 1 = waiting for SMS
    });
    
    return {
      success: true,
      data: newSession,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to request number',
    };
  }
};

export const checkOtpStatus = async (sessionId: string): Promise<ApiResponse<OtpSession>> => {
  try {
    // Find the session in our local store
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found',
      };
    }
    
    // Check status with SMS-Activate
    const result = await makeApiRequest({
      'action': 'getStatus',
      'id': sessionId,
    });
    
    // SMS-Activate status codes:
    // STATUS_WAIT_CODE - waiting for SMS
    // STATUS_WAIT_RETRY - waiting for code clarification
    // STATUS_WAIT_RESEND - waiting for code re-sending
    // STATUS_CANCEL - activation canceled
    // STATUS_OK:123456 - code received (123456 is the code)
    
    if (result.startsWith('STATUS_OK:')) {
      // Extract the OTP code
      const otp = result.split(':')[1];
      session.otp = otp;
      session.status = 'success';
    } else if (result === 'STATUS_CANCEL') {
      session.status = 'canceled';
    }
    
    return {
      success: true,
      data: session,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check OTP status',
    };
  }
};

export const cancelNumber = async (sessionId: string): Promise<ApiResponse<OtpSession>> => {
  try {
    // Find the session
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found',
      };
    }
    
    // Cancel the number with SMS-Activate
    await makeApiRequest({
      'action': 'setStatus',
      'id': sessionId,
      'status': '8', // 8 = cancel activation
    });
    
    // Update status to canceled
    session.status = 'canceled';
    
    return {
      success: true,
      data: session,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel number',
    };
  }
};

export const getUserSessions = async (userId: string): Promise<ApiResponse<OtpSession[]>> => {
  try {
    // Filter sessions for this user
    const userSessions = activeSessions.filter(s => s.userId === userId);
    
    // In a production app, you might want to store these in a database
    // and retrieve them from there instead of keeping them in memory
    
    return {
      success: true,
      data: userSessions,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user sessions',
    };
  }
};