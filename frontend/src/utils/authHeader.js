export const authHeader = () => {
    const token = localStorage.getItem("token");

    // Oruவேளை token illana empty object tharanum (Login mathiri public routes-ku prachanai varadhiri)
    if (!token) {
        return {
            "Content-Type": "application/json"
        };
    }

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};