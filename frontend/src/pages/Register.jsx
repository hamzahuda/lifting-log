import LoginRegisterForm from "../components/LoginRegisterForm.jsx";

export default function Register() {
    return <LoginRegisterForm route="/api/user/register/" method="register" />;
}
