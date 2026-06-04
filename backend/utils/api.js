export const authHeader = () => {
    return {
        Authorization:
            `Bearer ${localStorage.getItem(
                "token"
            )}`,
    };
};