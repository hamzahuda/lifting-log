import LoginRegisterForm from "../components/LoginRegisterForm.jsx";

export default function Register() {
    localStorage.clear();
    return <LoginRegisterForm route="/users/" method="register" />;
}
