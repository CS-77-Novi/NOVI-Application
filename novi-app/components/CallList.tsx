import { useEffect } from "react";
import { promiseHooks } from "v8";

const CallList = ({type} :{type : "ended" | "upcoming" | "recordings"}) =>
 
{ 

    const {endedcall, upcomingcalls, callrecordings, isLoading} = useGetCalls() 
    const[recordings,setrecordings ] = useState<callrecordings[]>([]);
   
    const getCalls = () =>{
        switch (type){
            case 'ended':
                return ended;
            case 'recordings':  
              
                return recordings ;  
            case 'upcoming':
                return upcomingCalls;
            default:
                return[];
            
        }
    };
}
    useEffect(() =>{
        const fetchRecordings = async () =>{
            const callData =await promiseHooks.all (
                callrecordings?.map ((meeting) =>meeting.quaryrecording ())??
                []);
            );
            const recordings  = callData
               .filter((call) =>call.recordings.length>0)
               .flatMap((call) =>call.recordings);

            setrecording (recordings );
        );
        
    },[type, callRecording ])

    if (IsLoading ) return <Loading/>;

    const calls  getCalls();

    if (calls && calls.length > 0) {
    return (
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Grid for calls */}
        {calls.map((meeting: Call | CallRecording) => {
          return (
            <MeetingCard
              call={meeting as Call} // Cast meeting as Call
              key={(meeting as Call).id} // Use call ID as key
              type={type} // Pass type prop
              icon={
                type === "ended"
                  ? "/assets/previous.svg" // Icon for ended calls
                  : type === "recordings"
                  ? "/assets/recordings2.svg" // Icon for recordings
                  : "/assets/upcoming.svg" // Icon for upcoming calls
              }
              title={(meeting as Calls).state?.custom?.description || "No Description"}
              date={
                type === "recordings"
                  ? (meeting as CallRecording).start_time
                  : (meeting as Calls).state?.startsAt?.toLocaleString()
              }
              isPreviousMeeting={type === "ended"}
              link={
                type === "recordings"
                  ? (meeting as CallsRecording).url
                  : ${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Calls).id}
              }
              buttonIcon1={type === 'ended'? '/icons/play.svg' : undefined}
              buttonText={type === "ended" ? "Play Recording" : "Start Meeting"}
            />
          );
        })}
      </div>
    );
  }

  return (
    <h1 className="text-center text-2xl font-bold text-white">
      No {type} meetings found
    </h1>
  );
};

    return (
       <Alert 
        title = 'No call available'
        iconUrl = '/assest/no-calls.svg'
    />
    );



export default CallList 