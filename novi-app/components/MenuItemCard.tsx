'use client'

import Image from "next/image";

interface MemuItemCardProps {
    img: string;
    title: string;
    bgColor?: string;
    hoverColor?: string;
    handleClick?: () => void;
}

const MenuItemCard = ({ img, title, handleClick }: MemuItemCardProps) => {
    return (
        <section
            className="bg-gradient-to-br from-[#185cab] to-[#9d17bd] hover:from-[#144a8f] hover:to-[#8513a0] menu-item-card shadow-2xl"
            onClick={handleClick}
            >
            <div>
                <Image src={img} alt="meeting" width={50} height={50}/>
            </div>
            
            <div className="">
                <h1 className="text-xl text-white font-black">{title}</h1>
            </div>
        </section>
    );

}

export default MenuItemCard