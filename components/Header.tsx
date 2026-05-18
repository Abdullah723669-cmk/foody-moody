"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { totalItems } = useCart();
  const { data: session } = useSession();

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image 
            src="/logo.png" 
            alt="Foody Moody 3D Logo" 
            width={48} 
            height={48} 
            style={{ objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }} 
          />
          Foody Moody
        </Link>

        <nav>
          <ul className="nav-links">
            <li><Link href="/">Menu</Link></li>
            <li><Link href="/#categories">Categories</Link></li>
            
            {session ? (
              <>
                <li>
                  <Link href={session.user?.role === "admin" ? "/dashboard/admin" : "/dashboard/user"}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button onClick={() => signOut()} className="logout-btn">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li><Link href="/login" className="login-link">Login</Link></li>
            )}
            
            <li>
              <Link href="/cart" className="cart-btn">
                🛒 Cart
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
