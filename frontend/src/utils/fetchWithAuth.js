export const fetchWithAuth = async (
    url,
    options = {}
) => {

    const token =
        localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,

        ...(options.headers || {}),
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // AUTO INVALID TOKEN HANDLE

    if (response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/owner/login";

        throw new Error("Unauthorized");
    }

    return response;
};