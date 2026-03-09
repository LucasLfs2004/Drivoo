/**
 * API Response Types
 * Defines all interfaces for API responses, tokens, and authentication
 */

// ============================================================================
// Token Types
// ============================================================================

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface TokenPayload {
    sub: string; // User ID
    email: string;
    iat: number; // Issued at
    exp: number; // Expiration time
    userType: 'student' | 'instructor' | 'admin';
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface LoginCredentials {
    email: string;
    senha: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    userType: 'student' | 'instructor' | 'admin';
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

// ============================================================================
// User Types
// ============================================================================

export type UserType = 'student' | 'instructor' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    userType: UserType;
    avatar?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
}

export interface StudentUser extends User {
    userType: 'student';
    cpf?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

export interface InstructorUser extends User {
    userType: 'instructor';
    crn?: string; // Carteira de Registro Nacional
    rating?: number;
    totalRatings?: number;
    bio?: string;
    yearsOfExperience?: number;
    specializations?: string[];
}

export interface AdminUser extends User {
    userType: 'admin';
    permissions?: string[];
}

// ============================================================================
// Authentication Response Types
// ============================================================================

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    // token: string;
    user: User;
}

export interface LoginResponse extends AuthResponse {
    token_type: string;
    expires_in: number;
}

export interface RegisterResponse extends AuthResponse {
    token_type: string;
    expires_in: number;
}

export interface LogoutResponse {
    message: string;
    success: boolean;
}

// ============================================================================
// User Data Response Types
// ============================================================================

export interface UserProfileResponse {
    data: User;
}

export interface UserUpdateRequest {
    name?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

export interface UserUpdateResponse {
    data: User;
    message: string;
}

// ============================================================================
// Generic API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
    timestamp?: string;
}

export interface ApiErrorResponse {
    error: string;
    message: string;
    statusCode: number;
    details?: Record<string, any>;
    timestamp?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// ============================================================================
// Error Types
// ============================================================================

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationErrorResponse extends ApiErrorResponse {
    details: {
        errors: ValidationError[];
    };
}

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// ============================================================================
// Request/Response Interceptor Types
// ============================================================================

export interface RequestConfig {
    headers?: Record<string, string>;
    timeout?: number;
    retryCount?: number;
}

export interface ResponseInterceptorContext {
    originalRequest: any;
    error: any;
    retryCount: number;
}

// ============================================================================
// Class/Lesson Types (for future use)
// ============================================================================

export interface Class {
    id: string;
    instructorId: string;
    studentId: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    price: number;
    createdAt: string;
    updatedAt: string;
}

export interface ClassResponse {
    data: Class;
}

export interface ClassListResponse extends PaginatedResponse<Class> { }

// ============================================================================
// Payment Types (for future use)
// ============================================================================

export interface Payment {
    id: string;
    classId: string;
    studentId: string;
    instructorId: string;
    amount: number;
    studentAmount: number;
    instructorAmount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentResponse {
    data: Payment;
}

export interface PaymentListResponse extends PaginatedResponse<Payment> { }

// ============================================================================
// Chat Types (for future use)
// ============================================================================

export interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    read: boolean;
    createdAt: string;
}

export interface MessageResponse {
    data: Message;
}

export interface MessageListResponse extends PaginatedResponse<Message> { }

// ============================================================================
// Health Check Types
// ============================================================================

export interface HealthCheckResponse {
    status: 'ok' | 'error';
    timestamp: string;
    version?: string;
}
