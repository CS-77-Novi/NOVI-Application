'use client'

import Image from "next/image"
import DateAndTime from "./DateAndTime"

const StatusBar = () => {
    return (
        <section className="flex flex-col gap-5 text-foreground 
        items-center md:items-start">

            {/* Render the DateAndTime component */}
                <DateAndTime/>

            {/* Display an image with specific styles */}
                <Image 
                    src='/assets/home-image.png' 
                    width={500} 
                    height={500} 
                    alt="home image" 
                    className="max-md:hidden -ml-16"
                />

        </section>
    )
}

export default StatusBar