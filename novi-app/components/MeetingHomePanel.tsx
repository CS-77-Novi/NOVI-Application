'use client'

import { useState, useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import MenuItemCard from './MenuItemCard';
import CallList from './CallList';
import { Button } from './ui/button';
import StatusBar from './StatusBar';
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
import DatePicker from "react-datepicker"
import { useUser } from "@clerk/nextjs"
import { useStreamVideoClient } from "@stream-io/video-react-sdk"
import { toast } from "sonner"
import Loading from "./Loading"

type ViewType = 'menu' | 'upcoming' | 'recordings' | 'ended' | 'reports';

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

interface MeetingHomePanelProps {
  onClose: () => void;
}

const MeetingHomePanel = ({ onClose }: MeetingHomePanelProps) => {
  const [view, setView] = useState<ViewType>('menu');
  const { user } = useUser()
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [meetingState, setMeetingState] = useState<'Schedule' | 'Instant' | undefined>(undefined);
  const client = useStreamVideoClient();

  const createMeeting = async () => {
    if (!user) return router.push('/login')
    if (!client) return router.push('/')

    try {
      if (!values.dateTime) {
        toast('Please select a date and time', {
          duration: 3000,
          className: 'bg-gray-300 rounded-3xl py-8 px-5 justify-center'
        });
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');

      const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'No Description';

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: { description },
        },
      });

      await call.updateCallMembers({
        update_members: [{ user_id: user.id }],
      })

      if (meetingState === 'Instant') {
        router.push(`/meeting/${call.id}`);
        toast('Setting up your meeting', {
          duration: 3000,
          className: '!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center',
        });
      }

      if (meetingState === 'Schedule') {
        router.push('/upcoming');
        toast(`Your meeting is scheduled at ${values.dateTime}`, {
          duration: 5000,
          className: '!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center',
        });
      }

    } catch (error: any) {
      toast(`Failed to create Meeting ${error.message}`, {
        duration: 3000,
        className: '!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center',
      })
    }
  }

  useEffect(() => {
    if (meetingState) {
      createMeeting();
    }
  }, [meetingState]);

  if (!client || !user) return <Loading />;

  const renderContent = () => {
    switch (view) {
      case 'menu':
        return (
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            <StatusBar />
            <div className="grid grid-cols-1 gap-4">
              <Dialog>
                <DialogTrigger>
                  <MenuItemCard
                    img="/assets/new-meeting.svg"
                    title="New Meeting"
                    bgColor='bg-orange-500'
                    hoverColor='hover:bg-orange-800'
                  />
                </DialogTrigger>
                <DialogContent className="glass-morphism border-white/20 px-16 py-10 text-gray-900 rounded-3xl backdrop-blur-xl" >
                  <DialogHeader>
                    <DialogTitle className='text-3xl font-black leading-relaxed text-center '>Start an Instant Meeting 🤝</DialogTitle>
                    <DialogDescription className='flex flex-col items-center '>
                      Add a meeting description
                      <Textarea
                        className="inputs p-5"
                        rows={4}
                        onChange={(e) => setValues({ ...values, description: e.target.value })}
                      />
                      <Button
                        className='mt-5 font-extrabold text-lg text-white rounded-xl bg-blue-700 py-5 px-10 hover:bg-blue-900 hover:scale-110 transition ease-in-out delay-75 duration-700 hover:-translate-y-1 cursor-pointer'
                        onClick={() => setMeetingState('Instant')}>
                        Create Meeting
                      </Button>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger>
                  <MenuItemCard
                    img="/assets/join-meeting.svg"
                    title="Join Meeting"
                    bgColor="bg-blue-600"
                    hoverColor='hover:bg-blue-800'
                  />
                </DialogTrigger>
                <DialogContent className="glass-morphism border-white/20 px-16 py-10 text-gray-900 rounded-3xl backdrop-blur-xl" >
                  <DialogHeader>
                    <DialogTitle className='text-3xl font-black leading-relaxed text-center mb-5 '>Type the Meeting link here</DialogTitle>
                    <DialogDescription className='flex flex-col gap-3 items-center'>
                      <Input
                        type='text'
                        placeholder="Meeting Link"
                        onChange={(e) => setValues({ ...values, link: e.target.value })}
                        className='inputs' />
                      <Button
                        className='mt-5 font-extrabold text-lg text-white rounded-xl bg-blue-700 py-5 px-10 hover:bg-blue-900 hover:scale-110 transition ease-in-out delay-75 duration-700 hover:-translate-y-1 cursor-pointer'
                        onClick={() => router.push(values.link)}>
                        Join Meeting
                      </Button>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger>
                  <MenuItemCard
                    img="/assets/calendar.svg"
                    title="Schedule"
                    bgColor="bg-blue-600"
                    hoverColor='hover:bg-blue-800' />
                </DialogTrigger>
                <DialogContent className="glass-morphism border-white/20 px-16 py-10 text-gray-900 rounded-3xl backdrop-blur-xl" >
                  <DialogHeader>
                    <DialogTitle className='text-3xl font-black leading-relaxed text-center mb-5 '>Schedule Meeting</DialogTitle>
                    <DialogDescription className='flex flex-col gap-3'>
                      Add a meeting description
                      <Textarea
                        className="inputs p-5"
                        rows={4}
                        onChange={(e) => setValues({ ...values, description: e.target.value })}
                      />
                    </DialogDescription>
                    <div className="flex w-full flex-col gap-2.5">
                      <label className="text-base font-normal leading-[22.4px] text-sky-2">Select Date and Time</label>
                      <DatePicker
                        selected={values.dateTime}
                        onChange={(date: Date | null) => setValues({ ...values, dateTime: date! })}
                        showTimeSelect
                        timeIntervals={15}
                        timeCaption="time"
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="inputs w-full rounded p-2 focus:outline-hidden focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                      />
                    </div>
                    <Button className='!mt-5 font-extrabold text-lg text-white rounded-xl bg-blue-700 py-5 px-10 hover:bg-blue-900 hover:scale-110 transition ease-in-out delay-75 duration-700 hover:-translate-y-1 cursor-pointer'
                      onClick={() => setMeetingState('Schedule')}>
                      Submit
                    </Button>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <MenuItemCard
                img="/assets/upcoming.svg"
                title="Upcoming"
                bgColor="bg-blue-600"
                hoverColor='hover:bg-blue-800'
                handleClick={() => setView('upcoming')}
              />
              <MenuItemCard
                img="/assets/recordings2.svg"
                title="Recordings"
                bgColor="bg-blue-600"
                hoverColor='hover:bg-blue-800'
                handleClick={() => setView('recordings')}
              />
              <MenuItemCard
                img="/assets/reports2.svg"
                title="Reports"
                bgColor="bg-blue-600"
                hoverColor='hover:bg-blue-800'
                handleClick={() => setView('reports')}
              />
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
      case 'upcoming':
      case 'recordings':
      case 'ended':
        return (
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setView('menu')}
                className="text-white hover:bg-gray-800"
              >
                <ChevronLeft size={20} />
              </Button>
              <h4 className="text-white font-medium capitalize">{view}</h4>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <CallList type={view as any} />
            </div>
          </div>
        );
      case 'reports':
        return (
           <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setView('menu')}
                className="text-white hover:bg-gray-800"
              >
                <ChevronLeft size={20} />
              </Button>
              <h4 className="text-white font-medium capitalize">Reports</h4>
            </div>
            <div className="flex-1 flex items-center justify-center text-gray-400">
               <p className="text-center">Reports view is available on the main dashboard.</p>
            </div>
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="w-80 h-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-4 flex flex-col animate-in fade-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>Home Information</span>
        </h3>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default MeetingHomePanel;
