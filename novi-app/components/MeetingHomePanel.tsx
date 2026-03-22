'use client' // Directs Next.js to render this component on the client side

// Import necessary React hooks for managing state and side effects
import { useState, useEffect } from 'react';
// Import icons from the lucide-react library
import { ChevronLeft, X } from 'lucide-react';
// Import custom components used within the panel
import MenuItemCard from './MenuItemCard';
import CallList from './CallList';
import { Button } from './ui/button';
import StatusBar from './StatusBar';
// Import Next.js router for programmatic navigation
import { useRouter } from "next/navigation"
// Import UI components for Modal Dialogs from the custom UI library
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
// Import form input components
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
// Import a date picker for scheduling meetings
import DatePicker from "react-datepicker"
// Import Clerk hook to access the currently authenticated user
import { useUser } from "@clerk/nextjs"
// Import Stream Video SDK client to manage and create video calls
import { useStreamVideoClient } from "@stream-io/video-react-sdk"
// Import toast for displaying pop-up notifications
import { toast } from "sonner"
// Import Loading spinner component
import Loading from "./Loading"

// Define the different views available within the panel
type ViewType = 'menu' | 'upcoming' | 'recordings' | 'ended' | 'reports';

// Define initial values for the meeting scheduling form
const initialValues = {
  dateTime: new Date(), // Default to the current date and time
  description: '',      // Default to empty description
  link: '',             // Default to empty meeting link
};

// Define the properties expected by the MeetingHomePanel component
interface MeetingHomePanelProps {
  onClose: () => void; // Function to call when the panel should be closed
}

// Define the main MeetingHomePanel component
const MeetingHomePanel = ({ onClose }: MeetingHomePanelProps) => {
  // State to track the current active view (defaults to 'menu')
  const [view, setView] = useState<ViewType>('menu');
  // Get the current user object from Clerk authentication
  const { user } = useUser()
  // Initialize the Next.js router for navigation
  const router = useRouter();
  // State to store form input values (date, description, link)
  const [values, setValues] = useState(initialValues);
  // State to track if we are creating an 'Instant' or 'Schedule' meeting
  const [meetingState, setMeetingState] = useState<'Schedule' | 'Instant' | undefined>(undefined);
  // Access the Stream Video client instance
  const client = useStreamVideoClient();

  // Async function to handle the creation of a new meeting
  const createMeeting = async () => {
    // If there is no authenticated user, redirect to the login page
    if (!user) return router.push('/login')
    // If the Stream client is not ready, redirect to the home page
    if (!client) return router.push('/')

    try {
      // Validate that a date and time are selected
      if (!values.dateTime) {
        // Show an error toast notification if no date/time is selected
        toast('Please select a date and time', {
          duration: 3000,
          className: 'bg-gray-300 rounded-3xl py-8 px-5 justify-center'
        });
        return; // Exit the function early
      }

      // Generate a unique ID for the new meeting session
      const id = crypto.randomUUID();
      // Initialize a new call object using the generated ID
      const call = client.call('default', id);
      // Throw an error if the call object fails to initialize
      if (!call) throw new Error('Failed to create meeting');

      // Convert the selected dateTime to an ISO string, or use the current time as a fallback
      const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      // Use the provided description or a default string
      const description = values.description || 'No Description';

      // Call the API to create the meeting or get it if it already exists
      await call.getOrCreate({
        data: {
          starts_at: startsAt, // Set the start time
          custom: { description }, // Set the custom description metadata
        },
      });

      // Add the current user as a member of the newly created call
      await call.updateCallMembers({
        update_members: [{ user_id: user.id }],
      })

      // If the user requested an Instant meeting
      if (meetingState === 'Instant') {
        // Navigate the user directly into the meeting room
        router.push(`/meeting/${call.id}`);
        // Notify the user that the meeting is setting up
        toast('Setting up your meeting', {
          duration: 3000,
          className: '!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center',
        });
      }

      // If the user requested to Schedule a meeting
      if (meetingState === 'Schedule') {
        // Redirect the user to the list of upcoming meetings
        router.push('/upcoming');
        // Notify the user that the meeting was successfully scheduled
        toast(`Your meeting is scheduled at ${values.dateTime}`, {
          duration: 5000,
          className: '!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center',
        });
      }

    } catch (error: any) {
      // Catch any errors during meeting creation and alert the user via toast
      toast(`Failed to create Meeting ${error.message}`, {
        duration: 3000,
        className: '!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center',
      })
    }
  }

  // Effect hook to trigger createMeeting whenever meetingState changes
  useEffect(() => {
    // Only attempt to create if meetingState is firmly set to 'Instant' or 'Schedule'
    if (meetingState) {
      createMeeting();
    }
  }, [meetingState]); // Re-run effect if meetingState updates

  // If the Stream client or user haven't loaded yet, show the loading spinner
  if (!client || !user) return <Loading />;

  // Function to render the correct UI elements based on the current 'view' state
  const renderContent = () => {
    switch (view) {
      // Display the main menu with meeting options
      case 'menu':
        return (
          // Scrollable container for the menu items
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {/* Display the top status bar (e.g., current date/time) */}
            <StatusBar />
            {/* Grid layout for the interactive menu cards */}
            <div className="grid grid-cols-1 gap-4">
              
              {/* Dialog for 'New Meeting' (Instant Meeting) */}
              <Dialog>
                {/* Visual trigger button for the Dialog */}
                <DialogTrigger>
                  <MenuItemCard
                    img="/assets/new-meeting.svg"
                    title="New Meeting"
                    bgColor='bg-orange-500' // Distinct visual color for starting a new meeting
                    hoverColor='hover:bg-orange-800'
                  />
                </DialogTrigger>
                {/* The actual popup content when the Dialog is open */}
                <DialogContent className="glass-morphism border-white/20 px-16 py-10 text-gray-900 rounded-3xl backdrop-blur-xl" >
                  <DialogHeader>
                    {/* Dialog title text */}
                    <DialogTitle className='text-3xl font-black leading-relaxed text-center '>Start an Instant Meeting 🤝</DialogTitle>
                    <DialogDescription className='flex flex-col items-center '>
                      Add a meeting description
                      {/* Text area for users to enter the instant meeting description */}
                      <Textarea
                        className="inputs p-5"
                        rows={4}
                        // Update the 'description' value in state when text changes
                        onChange={(e) => setValues({ ...values, description: e.target.value })}
                      />
                      {/* Submit button to initiate the Meeting creation process as 'Instant' */}
                      <Button
                        className='mt-5 font-extrabold text-lg text-white rounded-xl bg-blue-700 py-5 px-10 hover:bg-blue-900 hover:scale-110 transition ease-in-out delay-75 duration-700 hover:-translate-y-1 cursor-pointer'
                        onClick={() => setMeetingState('Instant')}>
                        Create Meeting
                      </Button>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              {/* Dialog for 'Join Meeting' using an existing link */}
              <Dialog>
                {/* Visual trigger button for the Dialog */}
                <DialogTrigger>
                  <MenuItemCard
                    img="/assets/join-meeting.svg"
                    title="Join Meeting"
                    bgColor="bg-blue-600"
                    hoverColor='hover:bg-blue-800'
                  />
                </DialogTrigger>
                {/* The actual popup content for joining a meeting */}
                <DialogContent className="glass-morphism border-white/20 px-16 py-10 text-gray-900 rounded-3xl backdrop-blur-xl" >
                  <DialogHeader>
                    {/* Dialog title text */}
                    <DialogTitle className='text-3xl font-black leading-relaxed text-center mb-5 '>Type the Meeting link here</DialogTitle>
                    <DialogDescription className='flex flex-col gap-3 items-center'>
                      {/* Text input for pasting a valid meeting link */}
                      <Input
                        type='text'
                        placeholder="Meeting Link"
                        // Update the 'link' value in state when text changes
                        onChange={(e) => setValues({ ...values, link: e.target.value })}
                        className='inputs' />
                      {/* Submit button to redirect the user directly to the provided link */}
                      <Button
                        className='mt-5 font-extrabold text-lg text-white rounded-xl bg-blue-700 py-5 px-10 hover:bg-blue-900 hover:scale-110 transition ease-in-out delay-75 duration-700 hover:-translate-y-1 cursor-pointer'
                        onClick={() => router.push(values.link)}>
                        Join Meeting
                      </Button>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              {/* Dialog for 'Scheduling' future meetings */}
              <Dialog>
                {/* Visual trigger button for scheduling */}
                <DialogTrigger>
                  <MenuItemCard
                    img="/assets/calendar.svg"
                    title="Schedule"
                    bgColor="bg-blue-600"
                    hoverColor='hover:bg-blue-800' />
                </DialogTrigger>
                {/* The actual popup content for selecting time and description */}
                <DialogContent className="glass-morphism border-white/20 px-16 py-10 text-gray-900 rounded-3xl backdrop-blur-xl" >
                  <DialogHeader>
                    {/* Dialog title text for schedule modal */}
                    <DialogTitle className='text-3xl font-black leading-relaxed text-center mb-5 '>Schedule Meeting</DialogTitle>
                    <DialogDescription className='flex flex-col gap-3'>
                      Add a meeting description
                      {/* Input for the scheduled meeting description */}
                      <Textarea
                        className="inputs p-5"
                        rows={4}
                        // Update description state on change
                        onChange={(e) => setValues({ ...values, description: e.target.value })}
                      />
                    </DialogDescription>
                    {/* Container for the date and time picker input */}
                    <div className="flex w-full flex-col gap-2.5">
                      <label className="text-base font-normal leading-[22.4px] text-sky-2">Select Date and Time</label>
                      {/* Third-party DatePicker component used to capture future dates */}
                      <DatePicker
                        selected={values.dateTime}
                        // Update the dateTime in state whenever a new date/time is chosen
                        onChange={(date: Date | null) => setValues({ ...values, dateTime: date! })}
                        showTimeSelect // Enable hour/minute selection
                        timeIntervals={15} // Break time intervals into 15-minute segments
                        timeCaption="time"
                        dateFormat="MMMM d, yyyy h:mm aa" // Visual formatting for the input field
                        className="inputs w-full rounded p-2 focus:outline-hidden focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                      />
                    </div>
                    {/* Button to confirm scheduling, setting the meeting state to 'Schedule' */}
                    <Button className='!mt-5 font-extrabold text-lg text-white rounded-xl bg-blue-700 py-5 px-10 hover:bg-blue-900 hover:scale-110 transition ease-in-out delay-75 duration-700 hover:-translate-y-1 cursor-pointer'
                      onClick={() => setMeetingState('Schedule')}>
                      Submit
                    </Button>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              {/* Standard menu button modifying state to show the 'upcoming' calls list */}
              <MenuItemCard
                img="/assets/upcoming.svg"
                title="Upcoming"
                bgColor="bg-blue-600"
                hoverColor='hover:bg-blue-800'
                handleClick={() => setView('upcoming')}
              />
              {/* Standard menu button modifying state to show past 'recordings' */}
              <MenuItemCard
                img="/assets/recordings2.svg"
                title="Recordings"
                bgColor="bg-blue-600"
                hoverColor='hover:bg-blue-800'
                handleClick={() => setView('recordings')}
              />
              {/* Standard menu button modifying state to show analytics 'reports' */}
              <MenuItemCard
                img="/assets/reports2.svg"
                title="Reports"
                bgColor="bg-blue-600"
                hoverColor='hover:bg-blue-800'
                handleClick={() => setView('reports')}
              />
              {/* Standard menu button resolving a route push directly to '/pop-quizzes' */}
              <MenuItemCard
                img="/assets/Pop-Quizzes.svg"
                title="Pop-Quizzes"
                bgColor="bg-blue-600"
                hoverColor='hover:bg-blue-800'
                handleClick={() => router.push('/pop-quizzes')}
              />
            </div>
          </div>
        );
      // Group the rendering of list-based views: upcoming, recordings, and ended tabs
      case 'upcoming':
      case 'recordings':
      case 'ended':
        return (
          // Container formatting for full-height list
          <div className="flex flex-col gap-4 h-full">
            {/* Header row area styling */}
            <div className="flex items-center gap-2 mb-2">
              {/* Back button enabling the user to revert to the main 'menu' view */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setView('menu')}
                className="text-white hover:bg-gray-800"
              >
                {/* Chevron icon representing a back arrow */}
                <ChevronLeft size={20} />
              </Button>
              {/* Dynamically display capitalizing the current view type as header text */}
              <h4 className="text-white font-medium capitalize">{view}</h4>
            </div>
            {/* Scrollable container hosting the dynamically populated CallList component */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {/* Inject the exact view parameter directing CallList to filter specific data */}
              <CallList type={view as any} />
            </div>
          </div>
        );
      // Specific rendering scenario allocated for the 'reports' view
      case 'reports':
        return (
          // General container scaling layout
           <div className="flex flex-col gap-4 h-full">
            {/* Header row defining the interactive back-button cluster */}
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setView('menu')}
                className="text-white hover:bg-gray-800"
              >
                {/* Visual back icon */}
                <ChevronLeft size={20} />
              </Button>
              {/* Context text for the reports section */}
              <h4 className="text-white font-medium capitalize">Reports</h4>
            </div>
            {/* Placeholder notification alerting the user to access reports from the main dashboard */}
            <div className="flex-1 flex items-center justify-center text-gray-400">
               <p className="text-center">Reports view is available on the main dashboard.</p>
            </div>
          </div>
        )
      // Fallback in case an undefined view was injected via state (fails safe to nothing rendered)
      default:
        return null;
    }
  };

  // Main encompassing UI container for the sidebar presentation logic
  return (
    // Slide-in animated window with defined borders matching app styling
    <div className="w-80 h-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-4 flex flex-col animate-in fade-in slide-in-from-right duration-300">
      {/* Upper header section for panel defining closing actions */}
      <div className="flex justify-between items-center mb-4">
        {/* Title for the panel itself */}
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>Home Information</span>
        </h3>
        {/* 'X' closing button mapped to parent's onClose property */}
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white transition-colors"
        >
          {/* Visual Close icon rendered */}
          <X size={20} />
        </button>
      </div>

      {/* Main content body delegating interface state checks to renderContent() helper method */}
      <div className="flex-1 overflow-hidden">
        {/* Dynamically displays views conditionally assessed from parent logic */}
        {renderContent()}
      </div>
    </div>
  );
};

// Expose component instance for consumption by application routes
export default MeetingHomePanel;
