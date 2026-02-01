import {useUser} from "@clerk/next.js";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

export const useGetCalls = () => {
    const {user} = useUser();
    const client = useStreamVideoClient();
    const [calls,setCalls] = useState<call[]>();
    const [isLoading, setIsLoading ] = useState(false);

    useEffect (() =>{
        const loadCalls = async () =>{
            if (!client  !user?.id)return;

            setIsLoading (true);
            try{
                const {calls }= await client?.queryCallStats({
                    sort:[{ field: 'starts_at',direction:-1}],
                    filter_conditions:{
                        starts_at: {$exists ; true},
                        $or: [
                            {created_by_user_id: user.id }.
                            {members: {$in: [user.id]}}.
                        ] 
                    }

            });
            setCalls (calls);
            }catch (error){
                console.error(error);
            }finally {
                setIsLoading(false);
            }

        };
          
        LoadCalls()
    },[client ,user?.id])
    const now = new Date();

    // endedCalls: Call[] that have either:
    //   * Started before the current time.
    //   * Have an endedAt timestamp (indicating the call has ended).
    const endedCalls = calls?.filter(({ state, startsAt, endedAt }) => Call)
    
    return (startsAt && new Date(startsAt) < now) || endedAt

  })
    })


// upcomingCalls: Calls that start in the future.
const upcomingCalls = calls?.filter(
  ({ state: { startsAt } }: Calls) => {
    return startsAt && new Date(startsAt) > now;
  }
);

// renaming the calls state when returning it from the hook.
// then returning all types of calls
return {
  upcomingCalls,endedCalls,callrecordings: Calls, isLoading}
