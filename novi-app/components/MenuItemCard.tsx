'use client'

import Image from "next/image";

interface MemuItemCardProps {
    img: string;
    title: string;
    bgColor:string;
    hoverColor:string;
    handleClick?: () => void;
    subtitle?: string;
    status?: 'loading' | 'ready' | 'error' | 'none';
}

const MenuItemCard = ({ bgColor, hoverColor ,img, title, handleClick, subtitle, status = 'none'}: 
    MemuItemCardProps) => {
    return (
        <section
            className={`${bgColor} ${hoverColor} menu-item-card shadow-2xl relative group`}
            onClick={handleClick}
            >
            {status !== 'none' && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                        status === 'ready' ? 'bg-green-400' : 
                        status === 'loading' ? 'bg-blue-400' : 'bg-red-400'
                    }`} />
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-tighter">
                        {status === 'ready' ? 'AI READY' : status === 'loading' ? 'CHECKING' : 'AI ERROR'}
                    </span>
                </div>
            )}
            <div>
                <Image src={img} alt="meeting" width={50} height={50}/>
            </div>
            
            <div className="flex flex-col">
                <h1 className="text-xl text-white font-black">{title}</h1>
                {subtitle && <p className="text-white/70 text-xs font-semibold mt-1">{subtitle}</p>}
            </div>
        </section>
    );

}

export default MenuItemCard