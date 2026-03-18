'use client';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import styles from './IndividualReport.module.css';

// TypeScript පාවිච්චි කරනවා නම් interface එකක් හදාගමු
interface DistractionEvent {
  type: string;
  time: string;
}

interface ReportData {
  lookingAwayCount: number;
  headPoseCount: number;
  eyeCloserCount: number;
  yawningCount: number;
  events: DistractionEvent[];
}

export default function IndividualReport() {
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Database එකෙන් එන data save කරගන්න state එක
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  // Page එක load වෙනකොට data fetch කරන්න
  useEffect(() => {
    async function fetchReportData() {
      try {
        // ඔබේ API endpoint එක මෙතනට දෙන්න (උදා: /api/reports/distractions)
        const response = await fetch('/api/reports/distractions');
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReportData();
  }, []);

  // Event type එක අනුව නිවැරදි CSS class එක ලබා දෙන helper function එකක්
  const getTimelineStyle = (type: string) => {
    switch (type) {
      case 'Looking Away': return styles.lookingAwayColor;
      case 'Eye Closer': return styles.eyeCloserColor;
      case 'Head Pose Deviation': return styles.cardHeadPoseDeviation;
      default: return '';
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className={styles.mainContent}>
        
        {/* ... Overview සහ Attention Score කොටස් පෙර පරිදිම තබා ගන්න ... */}

        {/* Distraction Events Section */}
        {activeTab === 'Distraction' && (
          <div className={styles.pinkBackgroundSection}>
            <h1 className={styles.header}>Distraction Events</h1>
            
            {loading ? (
              <p>Loading data...</p>
            ) : reportData ? (
              <>
                <div className={styles.statsGrid}>
                  <div className={`${styles.card} ${styles.cardLookingAway}`}>
                    Looking Away: {reportData.lookingAwayCount} Events
                  </div>
                  <div className={`${styles.card} ${styles.cardHeadPoseDeviation}`}>
                    Head Pose Deviation: {reportData.headPoseCount} Events
                  </div>
                  <div className={`${styles.card} ${styles.cardEyeClosure}`}>
                    Eye Closer: {reportData.eyeCloserCount} Events
                  </div>
                  <div className={`${styles.card} ${styles.cardYawing}`}>
                    Yawing: {reportData.yawningCount} Events
                  </div>
                </div>

                {/* Event Timeline කොටස - Dynamic */}
                <div className={styles.timelineContainer}>
                  <h2 className={styles.subHeader}>Event Timeline</h2>
                  <div className={styles.timelineBox}>
                    {reportData.events.length > 0 ? (
                      reportData.events.map((event, index) => (
                        <div 
                          key={index} 
                          className={`${styles.timelineItem} ${getTimelineStyle(event.type)}`}
                        >
                          {event.type} - {event.time}
                        </div>
                      ))
                    ) : (
                      <p className="text-white p-4">No events recorded during this session.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p>Failed to load report data.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}