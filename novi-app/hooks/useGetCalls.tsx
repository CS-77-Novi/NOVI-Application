import {useUser} from "@clerk/next.js";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

export const useGetCalls = () => {
    const {user} = useUser();
    const client = useStreamVideoClient();
    const [calls,setCalls] = useState<call[]>();


}