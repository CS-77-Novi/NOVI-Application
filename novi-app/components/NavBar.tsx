'use client';
import { SignedIn,  UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { navLinks } from '@/constants';
import { neobrutalism } from '@clerk/themes'
import { cn } from '@/lib/utils';


const NavBar = () => {
  const pathname = usePathname();

    return (
        <>
          <nav className="flex justify-between items-center fixed z-50 w-full h-24 glass-morphism px-10 gap-4 shadow-lg border-b border-white/10">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-1 hover:scale-105 transition-transform duration-300">
                <Image
                  src="/assets/Novi_logo-NoBackground.png"
                  width={60}
                  height={60}
                  alt="Let's talk"
                />
              </Link>

              {/* Nav Links */}
              <section className="sticky top-0 flex justify-between text-black ">
                <div className="flex flex-1 max-sm:gap-0 sm:gap-6">
                  {navLinks.map((item) => {
                    const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
                    
                    return (
                      <Link
                        href={item.route}
                        key={item.label}
                        className={
                          cn('flex gap-4 items-center p-3 rounded-xl justify-start hover:scale-105 transition-all duration-300 hover:bg-white/10',
                            isActive && 'bg-[#da32f8]/10 text-[#da32f8] border border-[#da32f8]/20'
                          )
                        }
                      >
                        <Image
                          src={item.imgURL}
                          alt={item.label}
                          width={24}
                          height={24}
                        />
                        
                        
                        
                        <p className={cn(
                            "text-lg font-semibold max-lg:hidden",
                          )}>
                          {item.label}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* User button */}
              <div className='hover:scale-105 transition-transform duration-300'>
                <SignedIn>
                    {/* Mount the UserButton component */}
                    <UserButton
                      appearance={{
                        baseTheme: neobrutalism,
                      }}
                    />
                </SignedIn>
        
              </div>
          </nav>
        </>
    )
}

export default NavBar