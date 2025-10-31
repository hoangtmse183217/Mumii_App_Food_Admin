const getAuthToken = (): string | null => {
    const storedUser = localStorage.getItem('adminUser');
    if (!storedUser) return null;
    try {
        const user = JSON.parse(storedUser);
        return user?.accessToken || null;
    } catch (e) {
        console.error("Could not parse user from localStorage", e);
        return null;
    }
};

const AUTH_BASE_URL = 'https://mumii-auth.onrender.com/api';

interface RequestOptions extends RequestInit {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    isAuthRequest?: boolean;
    noAuth?: boolean;
    baseUrlOverride?: string;
    signal?: AbortSignal;
}

const handleApiResponse = async (response: Response) => {
    if (response.status === 204) {
        return null;
    }

    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (error) {
        // If parsing fails, it might be a plain text response
        data = { success: false, message: text || `Request failed with status ${response.status}` };
    }

    // Helper to safely extract error message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getErrorMessage = (responseData: any): string | null => {
        if (responseData && typeof responseData.message === 'string') {
            return responseData.message;
        }
        if (responseData && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
            return responseData.errors.join(', ');
        }
        return null;
    };


    if (!response.ok) {
        const message = getErrorMessage(data);
        const error = new Error(message || 'An unknown API error occurred.');
        if (response.statusText === 'abort') {
            error.name = 'AbortError';
        }
        throw error;
    }
    
    if (data.success === false) {
       const message = getErrorMessage(data);
       throw new Error(message || 'The API indicated a failure but provided no message.');
    }

    return data;
};

export const apiClient = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const { method = 'GET', headers: customHeaders = {}, body, data, isAuthRequest = false, noAuth = false, baseUrlOverride, signal } = options;
    const token = getAuthToken();

    const headers: HeadersInit = {
        'Accept': 'application/json',
        ...customHeaders,
    };

    if (token && !noAuth) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
        signal,
    };
    
    if (data) {
        headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(data);
    } else if (body) {
        config.body = body;
    }
    
    const baseUrl = baseUrlOverride || (isAuthRequest ? AUTH_BASE_URL : null);
    if (!baseUrl) {
        throw new Error(`apiClient: No base URL specified for endpoint "${endpoint}". Please provide a baseUrlOverride.`);
    }
    const url = `${baseUrl}${endpoint}`;
    
    const response = await fetch(url, config);
    const responseData = await handleApiResponse(response);

    // Some APIs wrap data in a `data` property, some don't
    return (responseData?.data || responseData) as T;
};