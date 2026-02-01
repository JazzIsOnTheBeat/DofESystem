import { memo } from 'react';
import '../styles/layout.css';

const Layout = memo(function Layout({ children }) {
    return (
        <main className="layout">
            {children}
        </main>
    );
});

export default Layout;