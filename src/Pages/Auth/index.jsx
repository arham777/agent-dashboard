import React, { useEffect, useState, useCallback } from "react";
import CryptoJS from "crypto-js";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStatus } from "../../libs/hooks/useAuthToken";

const Authentication = () => {
  const { id: encryptedIdFromUrl } = useParams();
  const navigate = useNavigate();
  const { grantAccess } = useAuthStatus();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(
    "Initializing authentication..."
  );

  // IMPORTANT: These should ideally be stored in environment variables for security.
  const key = "fc721ab8bc759692fb3e42c0918531e9";
  const keyIV = "yhshshsjsksksisl";
  const LOCAL_STORAGE_KEY = "authenticatedUser";

  const processAuthentication = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage("Initializing authentication...");

    // --- Improved Logic: Check local storage first ---
    const storedUserDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedUserDataString) {
      try {
        const storedUserData = JSON.parse(storedUserDataString);
        // A "generic auth URL" means the URL doesn't contain a new, specific encrypted token.
        // This happens if encryptedIdFromUrl is undefined (e.g. route /auth) or is the placeholder "id".
        const isGenericAuthURL =
          !encryptedIdFromUrl ||
          (encryptedIdFromUrl.toLowerCase() === "id" &&
            encryptedIdFromUrl.length === 2);

        if (
          storedUserData &&
          storedUserData.userId &&
          storedUserData.data &&
          isGenericAuthURL
        ) {
          console.log(
            "User already authenticated (local storage) and on a generic auth path. Redirecting to dashboard..."
          );
          setStatusMessage(
            "Restoring session from local cache. Redirecting..."
          );
          grantAccess(); // Assumes grantAccess uses existing local storage or sets auth state
          navigate("/content");
          setIsLoading(false);
          return; // Authentication successful from local storage, skip further processing
        }
      } catch (e) {
        console.warn(
          "Error parsing local storage data. Clearing it and proceeding.",
          e
        );
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
      }
    }

    // --- Original Logic: Handle missing or placeholder token if not authenticated from local storage ---
    if (!encryptedIdFromUrl) {
      setStatusMessage("Authentication token not found in URL.");
      setError("Invalid authentication link. No token provided.");
      setIsLoading(false);
      return;
    }

    // If we're at /auth/id and didn't authenticate from local storage, it's an invalid state.
    if (
      encryptedIdFromUrl.toLowerCase() === "id" &&
      encryptedIdFromUrl.length === 2
    ) {
      setStatusMessage("Please use a valid authentication link to proceed.");
      setError(
        "This is an authentication entry point. A specific token is required in the URL."
      );
      setIsLoading(false);
      return;
    }

    // --- Proceed with token decryption and API validation if a specific token is present ---
    setStatusMessage("Processing authentication token...");
    let decryptedUserId;
    try {
      setStatusMessage("Decrypting token...");
      // Assuming encryptedIdFromUrl might be URL-safe Base64, convert to standard Base64 for atob.
      // Standard Base64 uses '+' and '/', URL-safe uses '-' and '_'.
      const standardBase64Token = encryptedIdFromUrl
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const cryptoJsBase64Ciphertext = atob(standardBase64Token);

      const decrypted = CryptoJS.AES.decrypt(
        cryptoJsBase64Ciphertext,
        CryptoJS.enc.Utf8.parse(key),
        {
          iv: CryptoJS.enc.Utf8.parse(keyIV),
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );
      decryptedUserId = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedUserId) {
        throw new Error("Decryption resulted in an empty User ID.");
      }
      setStatusMessage("Token decrypted. Validating user...");
    } catch (decryptionError) {
      console.error(
        "Decryption Error:",
        decryptionError,
        "Input was:",
        encryptedIdFromUrl
      );
      setError(
        "Invalid or corrupted authentication token. Please ensure you are using the correct link or try generating a new one."
      );
      setStatusMessage("Authentication Failed: Invalid Token");
      setIsLoading(false);
      return;
    }

    // --- Post-decryption: Check local storage again for this specific user ID (cache optimization) ---
    // This handles cases where the token is valid but data might already be cached.
    const currentStoredUserDataString = localStorage.getItem(LOCAL_STORAGE_KEY); // Re-fetch, could have been cleared
    if (currentStoredUserDataString) {
      try {
        const currentStoredUserData = JSON.parse(currentStoredUserDataString);
        if (
          currentStoredUserData &&
          currentStoredUserData.userId === decryptedUserId &&
          currentStoredUserData.data
        ) {
          console.log(
            "User data for decrypted ID found in local storage. Authenticating from cache..."
          );
          grantAccess();
          setStatusMessage(
            "Authentication successful from local cache! Redirecting..."
          );
          setIsLoading(false);
          navigate("/content");
          return; // Skip API call
        } else if (
          currentStoredUserData &&
          currentStoredUserData.userId !== decryptedUserId
        ) {
          console.log(
            "Local storage contained data for a different user. Clearing and proceeding with API call."
          );
          localStorage.removeItem(LOCAL_STORAGE_KEY); // Stale data for a different user
        }
      } catch (e) {
        console.warn(
          "Error parsing local storage data during decrypted ID check. Clearing.",
          e
        );
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }

    // --- Authenticate with backend API ---
    try {
      setStatusMessage(
        `Authenticating user (${decryptedUserId.substring(0, 8)}...) with backend...`
      ); // Avoid logging full ID if sensitive
      const endpoint = `http://10.229.220.15:8000/authenticate-user?user_id=${encodeURIComponent(decryptedUserId)}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: "", // Assuming an empty body is expected by the API
      });

      if (!response.ok) {
        let errorData = "User authentication via API failed.";
        try {
          const errJson = await response.json();
          errorData =
            errJson.detail || errJson.message || JSON.stringify(errJson);
        } catch (e) {
          errorData =
            (await response.text()) ||
            response.statusText ||
            `API error! status: ${response.status}`;
        }
        throw new Error(errorData);
      }

      const userDataFromApi = await response.json();

      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ userId: decryptedUserId, data: userDataFromApi })
      );
      console.log("User data fetched from API and stored in local storage.");

      grantAccess();

      setStatusMessage("Authentication successful! Redirecting...");
      navigate("/");
    } catch (apiError) {
      console.error("API Authentication Error:", apiError);
      setError(`Authentication failed: ${apiError.message}`);
      setStatusMessage("Authentication Failed at API validation.");
    } finally {
      setIsLoading(false);
    }
  }, [encryptedIdFromUrl, navigate, grantAccess]); // key and keyIV are component constants, not needed in deps

  useEffect(() => {
    processAuthentication();
  }, [processAuthentication]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          User Authentication Gate
        </h2>
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-3 text-blue-600">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p>{statusMessage}</p>
          </div>
        )}
        {!isLoading && error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            <p className="font-semibold text-lg mb-2">Authentication Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {!isLoading && !error && (
          // This message will typically only be seen briefly before redirect or if an error occurred but was cleared.
          // Successful states usually redirect.
          <p className="text-gray-700">{statusMessage}</p>
        )}
      </div>
    </div>
  );
};

export default Authentication;
