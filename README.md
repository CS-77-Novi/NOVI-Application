## NOVI Application 🎓📹

- NOVI Application is a Next.js-based intelligent video conferencing and analytics platform, tailored specifically for educational and focused remote session environments.

- The platform integrates real-time video communication with intelligent, on-device machine learning (Google MediaPipe) to track user head pose, attention score, and distraction levels during sessions without compromising user privacy. Automated capabilities include detailed post-session report generation, real-time analytics for instructors/hosts, and interactive quiz generation.

### ✨ Key Features

- Real-time Video Meetings: High-quality, scalable video calling capabilities powered by Stream Video SDK.
- AI-Powered Attention Tracking: Uses client-side machine learning to analyze face landmarks and head poses (yaw/pitch) to calculate real-time user focus and distraction metrics.
- Roles & Permissions: Differentiated experiences for Host/Teacher and Individual/Student participant roles.

- Advanced Analytics & Reporting:
  - Real-time distraction count for groups.
  - Comprehensive individual and group reports after the session ends.

- Session Quizzes: Automatic quiz generation workflows (/api/quiz) to assess knowledge and retention within sessions.
- Modern UI & Design System: Styled using Tailwind CSS v4 and highly accessible Radix UI primitives, featuring custom data visualizations powered by recharts.
- Robust Authentication: Secure user authentication managed via Clerk.
- Backend Database: Persistent tracking of meeting metadata, individual session analytics, and user states using Supabase.

### 💻 Tech Stack
- Framework: Next.js (App Router, v16)
- Language: TypeScript & JavaScript
- Styling: Tailwind CSS v4, clsx, tailwind-merge, and Radix UI
- Authentication: Clerk (@clerk/nextjs)
- Video/Audio Service: Stream React SDK
- Database & Storage: Supabase
- Machine Learning: Custom models over logic utilizing the browser (e.g. MediaPipe Face Landmarker APIs mapped in ml-calculations).
- Data Visualization: Recharts, React D3 Speedometer

### 🚀 Getting Started
**Prerequisites**
- Ensure you have Node.js (v18+) and npm/yarn/pnpm installed before starting. You will also need active accounts and API keys from Clerk, Stream, and Supabase.

1. Clone the Repository :
   - git clone https://github.com/your-username/NOVI-Application.git
   - cd NOVI-Application/novi-app
2. Install dependencies
   - npm install
3. Set up Environment Variables
   - Create a .env.local file in the root directory and add your secret keys.
      - Clerk Authentication
         - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
         - CLERK_SECRET_KEY=your_clerk_secret_key

      - Stream Video SDK
         - NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
         - STREAM_SECRET_KEY=your_stream_secret_key

      - Supabase
         - NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
         - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
         - SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
4. Run the Development Server
   - npm run dev

