const CallList = ({type}:{type: 'ended' 'upcoming' 'recordings'}) =>

    const {endedcall, upcomingcalls, callrecordings, isLoading} = useGetCalls() 