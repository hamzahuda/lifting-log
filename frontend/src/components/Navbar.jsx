import { Link, useMatch, useResolvedPath } from "react-router";

export default function Navbar() {
    return (
        <nav className="nav">
            LiftingLog
            <ul>
                <CustomLink to="/login">Login</CustomLink>
                <CustomLink to="/register">Register</CustomLink>
                <CustomLink to="/logout">Logout</CustomLink>
                <CustomLink to="/">Home</CustomLink>
                <CustomLink to="/templates">Templates</CustomLink>
            </ul>
        </nav>
    );
}

function CustomLink({ to, children, ...props }) {
    const resolvedPath = useResolvedPath(to);
    const isActive = useMatch({ path: resolvedPath.pathname, end: true });

    return (
        <li className={isActive ? "active" : ""}>
            <Link to={to} {...props}>
                {children}
            </Link>
        </li>
    );
}
