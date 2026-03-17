import MainMenu from "@/components/MainMenu"
import StatusBar from "@/components/StatusBar"
import RecentActivity from "@/components/RecentActivity"

const HomePage = () => {
    return (
        <div className="flex flex-col gap-16 pt-20 pl-10 items-center max-md:gap-10 md:flex-row animate-fade-in w-full max-w-7xl mx-auto">
            <StatusBar/>
            
            <div className="flex-1 w-full">
                <MainMenu/>
            </div>

            <div className="w-full md:w-auto">
                <RecentActivity />
            </div>
        </div>
    )
}

export default HomePage