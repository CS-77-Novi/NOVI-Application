import { SignUp } from "@clerk/nextjs"
import { neobrutalism } from "@clerk/themes"
import Image from "next/image"
import logoImage from "@/public/assets/Novi_logo-NoBackground.png"

const RegisterPage = () => {
    return (
        // Main container for the page
       <main className="flex flex-col items-center p-5 gap-10 animate-fade-in">

             {/* Section: logo + heading */}
            <section className="flex flex-col items-center">
                <Image
                    src={logoImage} // Path to logo image
                    width={100}     // Image width (px)
                    height={100}    // Image height (px)
                    alt="Novi Logo" // Alternative text for accessibility
                    priority
                    className="dark:brightness-0 dark:invert"
                    />
                    {/* Main title text under the logo */}
                    <h1 className="text-lg font-extrabold text-sky-1 lg:text-2xl">
                    Connect, Communicate, Collaborate in Real-Time
                    </h1>
            </section>

                {/* Wrapper for the sign-in component (spacing above) */}
                <div className="mt-3">

                    {/* Clerk SignIn UI component */}
                    <SignUp 
                    appearance={{
                        baseTheme: neobrutalism,
                    }}
                    />
                </div>
        </main>
    )
}

export default RegisterPage