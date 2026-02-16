/**
 * HTTP Client con retry logic y timeout
 * Cliente base para todas las peticiones HTTP de la aplicación
 */

class HTTPClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || "";
    this.timeout = config.timeout || 10000; // 10 segundos
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000; // 1 segundo
    this.headers = config.headers || {};
  }

  /**
   * Realizar petición HTTP con retry logic
   * @param {string} url - URL completa o path relativo
   * @param {Object} options - Opciones de fetch
   * @returns {Promise<any>} Respuesta parseada
   */
  async request(url, options = {}) {
    const fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    const fetchOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
        ...options.headers,
      },
    };

    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this._fetchWithTimeout(fullURL, fetchOptions);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error;

        // No reintentar en el último intento
        if (attempt < this.maxRetries) {
          console.warn(
            `[HTTPClient] Attempt ${attempt + 1} failed, retrying...`,
            error.message,
          );
          await this._delay(this.retryDelay * (attempt + 1)); // Exponential backoff
        }
      }
    }

    throw new Error(
      `Request failed after ${this.maxRetries + 1} attempts: ${lastError.message}`,
    );
  }

  /**
   * Fetch con timeout
   * @private
   */
  async _fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Delay helper para retry
   * @private
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export default HTTPClient;
