export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">🔥 Foody Moody</div>
        <p>Premium fast food, delivered to your door.</p>
        <ul className="footer-links">
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Privacy</a></li>
        </ul>
        <p>&copy; {new Date().getFullYear()} Foody Moody. All rights reserved.</p>
      </div>
    </footer>
  );
}
