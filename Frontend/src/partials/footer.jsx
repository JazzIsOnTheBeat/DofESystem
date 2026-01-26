import '../styles/footer.css';
import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer">
            <p className="footer-text">&copy; 2024 DofE Project. All rights reserved.</p>
            <div className="footer-meta">
                <Heart className="footer-icon" size={14} />
            </div>
        </footer>
    );
}

export default Footer;