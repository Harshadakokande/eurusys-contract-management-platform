/**
 * Layout Component
 * EUROSYS – Contract Management Platform
 */

import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useUIStore } from '../../stores';
import { Button } from '../ui/Button/Button';
import styles from './Layout.module.css';

export function Layout() {
    const { theme, toggleTheme } = useUIStore();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className={styles.appShell}>
            {/* Top Navigation Bar */}
            <header className={styles.topBar}>
                <div className={styles.topBarInner}>
                    {/* Brand */}
                    <div className={styles.brand}>
                        <NavLink to="/" className={styles.brandName}>
                            EURUSYS
                        </NavLink>
                        <span className={styles.brandTagline}>
                            Contract Management Platform
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className={styles.nav}>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                        >
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/blueprints"
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                        >
                            Blueprints
                        </NavLink>
                    </nav>

                    {/* Right Actions */}
                    <div className={styles.actions}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? '☾' : '☀'}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className={styles.pageArea}>
                <div className={styles.pageContainer}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

/* Page Header */
interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className={styles.pageHeader}>
            <div className={styles.pageHeaderText}>
                <h1 className={styles.pageTitle}>{title}</h1>
                {description && (
                    <p className={styles.pageDescription}>{description}</p>
                )}
            </div>

            {actions && (
                <div className={styles.pageHeaderActions}>
                    {actions}
                </div>
            )}
        </div>
    );
}
