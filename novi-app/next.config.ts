import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images : 
    remotePatterns: [
      { 
         protocol : 'https',
         hostname: 'img.cleark.com'

      } 
      { 
        protocol : 'https',
         hostname: 'img.cleark.dev'
         
      }
    }


  ]
};

export default nextConfig;
