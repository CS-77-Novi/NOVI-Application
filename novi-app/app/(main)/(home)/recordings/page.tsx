import CallList from "@/components/CallList";
import { useState } from "react";
import { Search, Video } from "lucide-react";
import { Input } from "@/components/ui/input";

const Recordings = () => {
    const [searchQuery, setSearchQuery] = useState('');
    return (
        <section className="flex size-full flex-col gap-10 p-6 md:p-10 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#da32f8] to-[#9d17bd] flex items-center justify-center shadow-lg shadow-purple-200">
                        <Video className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Recordings</h1>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                        placeholder="Search recordings..." 
                        className="pl-10 rounded-2xl bg-white border-gray-100 focus:ring-[#da32f8]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <CallList type="recordings" searchQuery={searchQuery} />
        </section>
    );
};
export default Recordings;

   