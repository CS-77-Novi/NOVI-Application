const CallList = ({type}:{type: 'ended' 'upcoming' 'recordings'}) =>
{ 

    const {endedcall, upcomingcalls, callrecordings, isLoading} = useGetCalls() 
    const[recordings,setrecordings ] = useState<callrecordings[]>([]);
}
export default CallList 